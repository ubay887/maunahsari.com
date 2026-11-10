<?php

namespace Database\Seeders;

use App\EventStatus;
use App\EventType;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $organizer = User::query()->where('email', 'admin@example.test')->first();
        if ($organizer === null) {
            return;
        }
        foreach ($this->categories() as [$name, $slug]) {
            Category::firstOrCreate(['slug' => $slug], ['name' => $name]);
        }
        foreach ($this->events() as $data) {
            $categorySlugs = $data['categories'];
            unset($data['categories']);
            $event = Event::withTrashed()->firstOrCreate(['slug' => $data['slug']], [...$data, 'organizer_id' => $organizer->id]);
            $event->categories()->syncWithoutDetaching(Category::whereIn('slug', $categorySlugs)->pluck('id')->all());
        }
    }

    /** @return array<int, array{string, string}> */
    private function categories(): array
    {
        return [
            ['Kajian', 'kajian'],
            ['Kegiatan Santri', 'kegiatan-santri'],
            ['Madrasah Diniyyah', 'madrasah-diniyyah'],
            ['Alumni', 'alumni'],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function events(): array
    {
        return [
            [
                'title' => 'Haul Muassis & Khataman Al-Qur’an',
                'slug' => 'haul-muassis-khataman-al-quran',
                'summary' => 'Peringatan haul KH. M. Mubassyir Mundzir yang dirangkai khataman Al-Qur’an bersama santri dan alumni.',
                'description' => <<<'HTML'
<p>Keluarga besar Pesantren Tahfidzul Qur’an Ma’unah Sari menggelar peringatan haul muassis, KH. M. Mubassyir Mundzir, yang dirangkai dengan khataman Al-Qur’an.</p>
<h2>Rangkaian acara</h2>
<ul>
<li>Khataman Al-Qur’an oleh santri putra dan putri.</li>
<li>Tahlil dan doa bersama di makam muassis.</li>
<li>Mauidhoh hasanah bersama pengasuh, KH. R. Abdul Hamid Abdul Qodir.</li>
</ul>
<p>Seluruh santri, wali santri, dan alumni diharapkan hadir tepat waktu dengan mengenakan pakaian yang sopan.</p>
HTML,
                'start_at' => now()->subWeeks(6)->setTime(19, 0),
                'end_at' => now()->subWeeks(6)->setTime(22, 0),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Aula Pondok Pesantren Ma’unah Sari',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'contact_whatsapp' => '6281245306020',
                'status' => EventStatus::Published,
                'categories' => ['kegiatan-santri', 'alumni'],
            ],
            [
                'title' => 'Silaturahmi Alumni dan Ziarah Makam Muassis',
                'slug' => 'silaturahmi-alumni-ziarah-makam-muassis',
                'summary' => 'Temu alumni lintas angkatan, dilanjutkan ziarah ke makam muassis dan pengasuh.',
                'description' => <<<'HTML'
<p>Forum silaturahmi alumni PTQ Ma’unah Sari kembali digelar untuk menyambung komunikasi lintas angkatan.</p>
<p>Acara dibuka dengan ziarah ke makam muassis, dilanjutkan sarasehan bersama pengurus pesantren untuk membahas rencana kegiatan alumni satu tahun ke depan.</p>
HTML,
                'start_at' => now()->subDays(40)->setTime(8, 0),
                'end_at' => now()->subDays(40)->setTime(13, 0),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Makam Muassis & Aula Pesantren',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'contact_whatsapp' => '6281245306020',
                'status' => EventStatus::Published,
                'categories' => ['alumni'],
            ],
            [
                'title' => 'Setoran Hafalan Akbar Santri Putra',
                'slug' => 'setoran-hafalan-akbar-santri-putra',
                'summary' => 'Setoran hafalan serentak santri putra kepada para mustami sesuai pembagian yang ditetapkan.',
                'description' => <<<'HTML'
<p>Setoran akbar dilaksanakan serentak bagi seluruh santri putra setelah salat Subuh, sebagai bagian dari evaluasi tengah semester hafalan.</p>
<p>Santri diharapkan menyetorkan hafalan pada mustami masing-masing sesuai juz yang telah ditentukan pengasuh.</p>
HTML,
                'start_at' => now()->subHours(2),
                'end_at' => now()->addHours(2),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Halaman Pondok Putra',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'contact_whatsapp' => '6281245306020',
                'status' => EventStatus::Published,
                'categories' => ['kegiatan-santri'],
            ],
            [
                'title' => 'Riyadloh 41 Khataman Santri Putri',
                'slug' => 'riyadloh-41-khataman-santri-putri',
                'summary' => 'Program riyadloh 41 hari bagi santri putri dengan mengkhatamkan Al-Qur’an satu kali setiap hari.',
                'description' => <<<'HTML'
<p>Riyadloh angkatan ini diikuti santri putri yang telah menyelesaikan hafalan Al-Qur’an, dengan target mengkhatamkan Al-Qur’an satu kali setiap hari selama 41 hari.</p>
<h2>Ketentuan peserta</h2>
<ul>
<li>Mengikuti deresan malam pukul 21.30 hingga selesai.</li>
<li>Menyetorkan hasil khataman harian kepada mustami’ masing-masing.</li>
<li>Menjaga adab dan ketertiban selama kegiatan berlangsung.</li>
</ul>
HTML,
                'start_at' => now()->subDays(5)->setTime(4, 30),
                'end_at' => now()->addDays(36)->setTime(22, 0),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Aula Pondok Putri',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'contact_whatsapp' => '6285645717767',
                'status' => EventStatus::Published,
                'categories' => ['kegiatan-santri'],
            ],
            [
                'title' => 'Kajian Kitab Al-Hikam Bersama Pengasuh',
                'slug' => 'kajian-kitab-al-hikam-bersama-pengasuh',
                'summary' => 'Kajian rutin kitab Al-Hikam yang diasuh langsung oleh KH. R. Abdul Hamid Abdul Qodir.',
                'description' => <<<'HTML'
<p>Kajian kitab Al-Hikam kembali dilaksanakan di aula pesantren dan terbuka untuk santri, wali santri, serta masyarakat umum.</p>
<p>Peserta diharapkan membawa kitab masing-masing dan hadir sebelum pengajian dimulai.</p>
HTML,
                'start_at' => now()->addWeek()->setTime(19, 30),
                'end_at' => now()->addWeek()->setTime(21, 30),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Aula Pondok Pesantren Ma’unah Sari',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'contact_whatsapp' => '6281245306020',
                'status' => EventStatus::Published,
                'categories' => ['kajian'],
            ],
            [
                'title' => 'Pembukaan Madrasah Diniyyah Al Mundziriyyah',
                'slug' => 'pembukaan-madrasah-diniyyah-al-mundziriyyah',
                'summary' => 'Awal semester Madrasah Diniyyah Al Mundziriyyah bagi santri kelas I sampai kelas IV.',
                'description' => <<<'HTML'
<p>Kegiatan Madrasah Diniyyah Al Mundziriyyah memasuki semester baru dan dilaksanakan setelah salat Isya, pukul 20.00 sampai 21.00.</p>
<p>Santri putra ditempatkan pada Kelas I dan Kelas II sesuai kemampuan menulis aksara Pegon, sedangkan santri putri pada Kelas I sampai Kelas IV.</p>
HTML,
                'start_at' => now()->addDays(10)->setTime(20, 0),
                'end_at' => now()->addDays(10)->setTime(21, 0),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Ruang Madrasah Diniyyah',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'contact_whatsapp' => '6281245306020',
                'status' => EventStatus::Published,
                'categories' => ['madrasah-diniyyah', 'kegiatan-santri'],
            ],
            [
                'title' => 'Webinar Tahfidz untuk Wali Santri',
                'slug' => 'webinar-tahfidz-untuk-wali-santri',
                'summary' => 'Webinar daring pendampingan hafalan anak di rumah bagi wali santri baru.',
                'description' => <<<'HTML'
<p>Webinar ini membahas cara mendampingi anak dalam muroja’ah hafalan selama di rumah, mulai dari menyiapkan waktu khusus sampai menjaga semangat anak.</p>
<p>Narahubung pendaftaran: Kantor Putra 0812-4530-6020 dan Kantor Putri 0856-4571-7767. Tautan ruang daring dikirim melalui WhatsApp kepada wali yang mendaftar.</p>
HTML,
                'start_at' => now()->addDays(5)->setTime(9, 0),
                'end_at' => now()->addDays(5)->setTime(10, 30),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Online,
                'location_name' => null,
                'address' => null,
                'meeting_url' => 'https://meet.google.com/abc-defg-hij',
                'contact_whatsapp' => '6285645717767',
                'status' => EventStatus::Published,
                'categories' => ['kajian'],
            ],
            [
                'title' => 'Diklat Qira’ah Sab’ah untuk Santri Huffazh',
                'slug' => 'diklat-qiraah-sabah-untuk-santri-huffazh',
                'summary' => 'Pelatihan perbandingan bacaan tujuh imam qira’at bagi santri yang telah khatam hafalan.',
                'description' => <<<'HTML'
                    <p>Diklat ini dikhususkan bagi santri yang telah menyelesaikan hafalan Al-Qur’an secara keseluruhan, dengan prioritas hafalan yang benar-benar lancar.</p>
                    <h2>Materi</h2>
                    <ul>
                    <li>Pengantar ushul qira’at dan riwayat para imam.</li>
                    <li>Praktik tashih bacaan per imam qira’at.</li>
                    <li>Setoran bacaan kepada pembimbing.</li>
                    </ul>
                    <p>Peserta yang tidak dapat hadir di aula pesantren dapat mengikuti sesi daring melalui tautan yang dibagikan panitia.</p>
                HTML,
                'start_at' => now()->addWeeks(3)->setTime(8, 0),
                'end_at' => now()->addWeeks(3)->setTime(14, 0),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Hybrid,
                'location_name' => 'Aula Pondok Pesantren Ma’unah Sari',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'meeting_url' => 'https://meet.google.com/qsh-huffazh-diklat',
                'contact_whatsapp' => '6281245306020',
                'status' => EventStatus::Published,
                'categories' => ['kajian', 'kegiatan-santri'],
            ],
            [
                'title' => 'Dauroh Bahasa Arab Santri Baru',
                'slug' => 'dauroh-bahasa-arab-santri-baru',
                'summary' => 'Pembekalan bahasa Arab dasar sebelum kegiatan Madrasah Diniyyah dimulai.',
                'description' => <<<'HTML'
<p>Dauroh ini menyiapkan santri baru mengenal kosakata harian, membaca teks sederhana, dan menulis aksara Pegon sebelum masuk kelas Madrasah Diniyyah.</p>
<p>Jadwal dan pembagian kelompok masih dalam pembahasan pengurus, sehingga halaman ini belum ditampilkan kepada pengunjung.</p>
HTML,
                'start_at' => now()->addWeeks(2)->setTime(15, 30),
                'end_at' => now()->addWeeks(2)->setTime(17, 0),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Ruang Kelas Madrasah',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'status' => EventStatus::Draft,
                'categories' => ['madrasah-diniyyah'],
            ],
            [
                'title' => 'Festival Ma’unah Sari Bersholawat',
                'slug' => 'festival-maunah-sari-bersholawat',
                'summary' => 'Festival sholawat bersama santri dan masyarakat Kediri yang ditunda sampai waktu yang akan diumumkan.',
                'description' => <<<'HTML'
<p>Festival sholawat ini direncanakan menampilkan hadrah santri dan grup sholawat undangan dari Kota Kediri.</p>
<h2>Pemberitahuan</h2>
<p>Panitia membatalkan jadwal semula karena bersamaan dengan agenda haul pesantren. Informasi jadwal pengganti akan diumumkan melalui kanal resmi pesantren.</p>
HTML,
                'start_at' => now()->addWeeks(4)->setTime(19, 0),
                'end_at' => now()->addWeeks(4)->setTime(22, 0),
                'timezone' => 'Asia/Jakarta',
                'type' => EventType::Offline,
                'location_name' => 'Lapangan Pesantren',
                'address' => 'Jl. KH. Agus Salim No. 08, Bandar Kidul, Mojoroto, Kota Kediri',
                'contact_whatsapp' => '6281245306020',
                'status' => EventStatus::Cancelled,
                'categories' => ['kegiatan-santri'],
            ],
        ];
    }
}
