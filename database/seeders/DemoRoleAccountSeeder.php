<?php

namespace Database\Seeders;

use App\Actions\Psb\RegistrationNumber;
use App\AdminRole;
use App\ApplicantSource;
use App\Models\Applicant;
use App\Models\Program;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Pondok;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

/**
 * Akun demo untuk role selain admin (editor, penulis, alumni, calon santri) agar tombol
 * masuk satu klik di halaman login punya tujuan. Daftar akun ada di config/demo.php, admin
 * dibuat oleh {@see DemoUserSeeder}. Aman dijalankan ulang; hanya berjalan di local/testing.
 */
class DemoRoleAccountSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $this->staff('editor', AdminRole::Editor);
        $this->staff('author', AdminRole::Author);
        $this->alumnus();
        $this->applicant();
    }

    private function staff(string $key, AdminRole $role): void
    {
        $user = $this->account($key);

        if ($user->roles()->doesntExist()) {
            $user->assignStaffRole($role);
        }
    }

    private function alumnus(): void
    {
        $this->account('alumni');
    }

    /** Pendaftar demo berstatus `registered` pada periode berjalan, sehingga data dan berkas masih bisa diubah. */
    private function applicant(): void
    {
        $user = $this->account('applicant', applicant: true);

        if ($user->applicant()->exists()) {
            return;
        }

        $this->call(RegistrationPeriodSeeder::class);
        $period = RegistrationPeriod::query()->where('academic_year', '2026/2027')->firstOrFail();
        $program = Program::query()->orderBy('sort_order')->firstOrFail();

        Applicant::factory()->create([
            'user_id' => $user->id,
            'registration_number' => app(RegistrationNumber::class)->next($period, Pondok::Putra),
            'registration_period_id' => $period->id,
            'program_id' => $program->id,
            'source' => ApplicantSource::Online,
            'full_name' => 'Calon Santri Demo',
            'guardian_name' => config('demo.accounts.applicant.name'),
        ]);
    }

    private function account(string $key, bool $applicant = false): User
    {
        /** @var array{name: string, email: string} $account */
        $account = config('demo.accounts.'.$key);

        $factory = $applicant ? User::factory()->applicant() : User::factory();

        return User::query()->firstOrCreate(
            ['email' => $account['email']],
            $factory->make(Arr::only($account, ['name', 'email']))->getAttributes(),
        );
    }
}
