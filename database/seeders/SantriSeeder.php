<?php

namespace Database\Seeders;

use App\Actions\Psb\AcceptApplicant;
use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * Santri dari pelamar yang diterima, dibuat lewat aksi penerimaan yang sama dengan panel admin
 * (salin data pelamar dan foto). Santri angkatan lama sebagian sudah tidak aktif. Bergantung pada
 * {@see PsbDemoSeeder}. Hanya berjalan di local/testing.
 */
class SantriSeeder extends Seeder
{
    /** Persentase santri yang masih aktif menurut tahun masuk. */
    private const ACTIVE_RATE = [2023 => 60, 2024 => 85];

    public function run(AcceptApplicant $accept): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $admin = User::where('role', 'admin')->orderBy('id')->first() ?? throw new RuntimeException('Tidak ada akun admin. Jalankan DemoUserSeeder terlebih dahulu.');

        Applicant::query()
            ->where('status', ApplicantStatus::Accepted)
            ->whereDoesntHave('santri')
            ->with('registrationPeriod')
            ->orderBy('id')
            ->each(function (Applicant $applicant) use ($accept, $admin): void {
                $santri = $accept->handle($applicant, $admin);
                $rate = self::ACTIVE_RATE[$santri->entry_year] ?? 100;
                if (($applicant->id * 37) % 100 >= $rate) {
                    Santri::whereKey($santri->id)->update(['is_active' => false]);
                }
            });
    }
}
