<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Data referensi dan konten situs aman dijalankan di produksi. Akun demo dan
     * event contoh hanya terisi di local/testing; data alumni dan PSB demo
     * dipanggil terpisah lewat {@see DemoSeeder}.
     */
    public function run(): void
    {
        $this->call([
            // Referensi: peran admin, wilayah Indonesia, program, periode PSB.
            RoleSeeder::class,
            \Laravolt\Indonesia\Seeds\DatabaseSeeder::class,
            AlumniRegionSeeder::class,
            ProgramSeeder::class,
            RegistrationPeriodSeeder::class,
            // Konten situs: artikel memerlukan penulis admin, jadi menyusul akun demo.
            DemoUserSeeder::class,
            DemoRoleAccountSeeder::class,
            ArticleSeeder::class,
            EventSeeder::class,
            SitePageSeeder::class,
        ]);
    }
}
