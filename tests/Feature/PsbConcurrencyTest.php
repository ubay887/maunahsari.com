<?php

namespace Tests\Feature;

use App\Models\ProgramQuota;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class PsbConcurrencyTest extends TestCase
{
    public function test_two_processes_competing_for_one_sqlite_seat_cannot_overbook(): void
    {
        $database = tempnam(sys_get_temp_dir(), 'psb-race-');
        $this->assertNotFalse($database);
        $connection = config('database.default');
        config(['database.connections.psb_race' => [...config('database.connections.sqlite'), 'database' => $database, 'url' => null, 'busy_timeout' => 10000]]);
        $workers = [];
        try {
            Artisan::call('migrate', ['--database' => 'psb_race', '--force' => true, '--no-interaction' => true]);
            DB::setDefaultConnection('psb_race');
            $quota = ProgramQuota::factory()->create(['capacity' => 1]);
            $worker = <<<'PHP'
                require $argv[1].'/vendor/autoload.php';
                $app = require $argv[1].'/bootstrap/app.php';
                $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
                config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $argv[2], 'database.connections.sqlite.url' => null, 'database.connections.sqlite.busy_timeout' => 10000]);
                Illuminate\Support\Facades\DB::purge('sqlite');
                $data = App\Models\Applicant::factory()->raw(['registration_period_id' => (int) $argv[3], 'program_id' => (int) $argv[4]]);
                try {
                    app(App\Actions\Psb\SubmitApplication::class)->handle($data, [], App\ApplicantSource::Offline);
                    echo 'created';
                } catch (Illuminate\Validation\ValidationException $exception) {
                    echo isset($exception->errors()['program_id']) ? 'closed' : 'unexpected';
                }
                PHP;
            foreach ([1, 2] as $index) {
                $process = new Process([PHP_BINARY, '-r', $worker, base_path(), $database, (string) $quota->registration_period_id, (string) $quota->program_id], base_path(), ['APP_ENV' => 'testing']);
                $process->setTimeout(25);
                $process->start();
                $workers[] = $process;
            }
            $results = [];
            foreach ($workers as $process) {
                $process->wait();
                $this->assertTrue($process->isSuccessful(), $process->getErrorOutput().$process->getOutput());
                $results[] = trim($process->getOutput());
            }
            sort($results);
            $this->assertSame(['closed', 'created'], $results);
            $this->assertSame(1, $quota->usedCount());
        } finally {
            foreach ($workers as $process) {
                if ($process->isRunning()) {
                    $process->stop();
                }
            }
            DB::purge('psb_race');
            DB::setDefaultConnection($connection);
            if (file_exists($database)) {
                unlink($database);
            }
            foreach (['-wal', '-shm'] as $suffix) {
                if (file_exists($database.$suffix)) {
                    unlink($database.$suffix);
                }
            }
        }
    }
}
