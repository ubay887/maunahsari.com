<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

/**
 * Program pendidikan PTQ Ma'unah Sari (sumber: maunahsari.com/pondok-putra dan /pondok-putri).
 */
class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->programs() as $program) {
            Program::updateOrCreate(['slug' => $program['slug']], $program);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function programs(): array
    {
        return [
            [
                'name' => 'Bil-Hifdhi',
                'slug' => 'bil-hifdhi',
                'description' => 'Program khusus bagi santri yang ingin menghafal Al-Qur’an dengan sistem pengajian sorogan. Santri menyetorkan hafalan kepada pengasuh atau ustadz untuk disimak dan ditashih bacaannya, sehingga terbentuk hafalan yang kuat, benar, dan sesuai kaidah bacaan Al-Qur’an.',
                'requires_hafalan' => false,
                'sort_order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Bin-Nadhor',
                'slug' => 'bin-nadhor',
                'description' => 'Sistem pembelajarannya sama dengan Bil-Hifdhi, namun saat penyimakan berlangsung santri membawa mushaf dan membaca langsung untuk didengarkan serta ditashih bacaannya oleh pengasuh maupun ustadz. Program ini difokuskan pada perbaikan dan pemantapan kualitas bacaan Al-Qur’an santri.',
                'requires_hafalan' => false,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Qira’ah Sab’ah',
                'slug' => 'qiraah-sabah',
                'description' => 'Kajian perbandingan bacaan Al-Qur’an menurut satu imam qira’at dengan imam lainnya yang masyhur, berjumlah tujuh imam qira’at (Qurra’ Sab’ah). Pesertanya adalah santri yang telah menyelesaikan hafalan Al-Qur’an secara keseluruhan, dengan prioritas santri yang hafalannya benar-benar lancar.',
                'requires_hafalan' => true,
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Riyadloh',
                'slug' => 'riyadloh',
                'description' => 'Riyadloh dilaksanakan dengan mengkhatamkan Al-Qur’an satu kali setiap hari selama 41 kali khataman. Program ini diperuntukkan bagi santri yang telah menyelesaikan hafalan Al-Qur’an, dan tidak menutup kemungkinan bagi santri yang belum menyelesaikan hafalan untuk mengikutinya dengan ketentuan tertentu.',
                'requires_hafalan' => true,
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];
    }
}
