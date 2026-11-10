<?php

namespace Database\Seeders;

use App\ImportStatus;
use App\Models\AlumniImportBatch;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Riwayat impor alumni. Jumlah profil yang berhasil dibuat disesuaikan dengan profil
 * ber-sumber impor yang ada, sehingga halaman riwayat impor konsisten dengan daftar alumni.
 * Hanya berjalan di local/testing.
 */
class AlumniImportBatchSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $admin = User::where('email', 'alumni-admin@example.test')->first();
        if ($admin === null) {
            return;
        }
        $imported = AlumniProfile::where('source', 'import')->count();
        $first = (int) round($imported * 0.62);
        $second = $imported - $first;

        $batches = [
            ['alumni-angkatan-2008-2014.csv', ImportStatus::Completed, $first + 2, $first, [
                ['row' => 7, 'errors' => ['Angkatan wajib diisi.']],
                ['row' => 14, 'errors' => ['Duplikat nama, angkatan, dan wilayah.']],
            ], now()->subDays(48)],
            ['data-alumni-jawa-timur.xlsx', ImportStatus::Completed, $second + 1, $second, [
                ['row' => 9, 'errors' => ['Kota/kabupaten tidak ditemukan.']],
            ], now()->subDays(21)],
            ['alumni-susulan.csv', ImportStatus::Failed, 15, 0, [
                ['row' => 0, 'errors' => ['Impor gagal diproses. Tidak ada profil yang dibuat; unggah ulang berkas.']],
            ], now()->subDays(6)],
        ];

        foreach ($batches as [$file, $status, $total, $created, $errors, $at]) {
            AlumniImportBatch::unguarded(fn () => AlumniImportBatch::updateOrCreate(
                ['file_name' => $file],
                [
                    'status' => $status,
                    'total' => $total,
                    'created_count' => $created,
                    'failed_count' => count($errors),
                    'errors' => $errors,
                    'payload' => null,
                    'imported_by' => $admin->id,
                    'created_at' => $at->startOfMinute(),
                    'updated_at' => $at->copy()->addMinutes(2)->startOfMinute(),
                ],
            ));
        }
    }
}
