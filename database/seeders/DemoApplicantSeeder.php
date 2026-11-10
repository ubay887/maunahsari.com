<?php

namespace Database\Seeders;

use App\Actions\Psb\RegistrationNumber;
use App\ApplicantSource;
use App\Models\Applicant;
use App\Models\Program;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Pondok;
use Illuminate\Database\Seeder;

/**
 * Data pendaftar untuk akun demo calon santri ({@see DemoRoleAccountSeeder}): berstatus
 * `registered` pada periode berjalan, sehingga data dan berkas masih bisa diubah.
 * Bukan data awal; dijalankan lewat {@see DemoSeeder}. Hanya berjalan di local/testing.
 */
class DemoApplicantSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $user = User::query()->where('email', config('demo.accounts.applicant.email'))->first();

        if ($user === null || $user->applicant()->exists()) {
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
}
