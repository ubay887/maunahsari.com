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
     * Data awal hanya data master (peran, wilayah, program, periode PSB) dan akun
     * pengguna. Akun demo hanya terisi di local/testing. Artikel, acara, konten
     * halaman, serta data alumni dan PSB contoh dijalankan terpisah lewat
     * {@see DemoSeeder} atau seeder masing-masing.
     */
    public function run(): void
    {
        $this->call([
            // Data master: peran admin, wilayah Indonesia, program, periode PSB.
            RoleSeeder::class,
            \Laravolt\Indonesia\Seeds\DatabaseSeeder::class,
            AlumniRegionSeeder::class,
            ProgramSeeder::class,
            RegistrationPeriodSeeder::class,
            // Pengguna.
            DemoUserSeeder::class,
            DemoRoleAccountSeeder::class,
        ]);
    }
}
