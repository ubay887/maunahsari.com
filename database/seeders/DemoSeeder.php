<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seluruh data contoh untuk pengembangan: `php artisan db:seed --class=DemoSeeder`.
 * Semua seeder di dalamnya menolak berjalan di luar local/testing, dan urutannya
 * mengikuti ketergantungan data (akun, konten situs, alumni, riwayat alumni, PSB, santri, audit).
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $this->call([
            DemoUserSeeder::class,
            DemoRoleAccountSeeder::class,
            DemoApplicantSeeder::class,
            ArticleSeeder::class,
            EventSeeder::class,
            SitePageSeeder::class,
            AlumniDemoSeeder::class,
            AlumniConsentSeeder::class,
            AlumniContactSeeder::class,
            AlumniImportBatchSeeder::class,
            PsbDemoSeeder::class,
            SantriSeeder::class,
            AuditLogSeeder::class,
        ]);
    }
}
