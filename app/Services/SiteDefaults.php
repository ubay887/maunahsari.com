<?php

namespace App\Services;

use App\SitePageKey;

/**
 * Built-in content of the public pages. It seeds the admin forms and is the
 * fallback while a page has never been saved.
 */
class SiteDefaults
{
    /** @return array<string, mixed> */
    public static function for(SitePageKey $key): array
    {
        return match ($key) {
            SitePageKey::Profile => self::profile(),
            SitePageKey::PondokPutra => self::pondokPutra(),
            SitePageKey::PondokPutri => self::pondokPutri(),
            SitePageKey::Contact => self::contact(),
        };
    }

    /** @return array<string, mixed> */
    private static function profile(): array
    {
        return [
            'history_html' => "<p>Pesantren Tahfidhul Qur'an Ma'unah Sari merupakan lembaga pendidikan Islam di Kota Kediri yang didirikan pada tahun 1967 M oleh <strong>Simbah KH. M. Mubassyir Mundzir bin KH. M. Imam Bachri</strong>. Nasab beliau, jika dirunut, bersambung hingga Rasulullah saw. melalui jalur Sayyidina Husain.</p>"
                ."<p>Pada masa awal perkembangannya, pesantren ini lebih mengkhususkan pada bidang tasawuf, terutama mengistiqamahkan shalat berjamaah, wirid, dan zikir. Seiring berjalannya waktu, pesantren ini bertransformasi menjadi Pesantren Tahfidhul Qur'an dengan hadirnya <strong>Simbah Nyai Hj. Zuhriyyah Munawwir Al-Hafizhah</strong> binti Al-Muqri Al-Hafidz KH. R. Munawwir Krapyak Yogyakarta yang menjadi istri muassis PTQ Ma'unah Sari pada tahun 1973.</p>"
                ."<p>Eksistensi beliau menambah corak Qur'ani dalam lingkup pesantren ini yang awalnya lebih bertendensi kepada ranah tasawuf, namun tanpa memudarkan nilai-nilai spiritual tasawuf tersebut, serta meningkatkan kualitas dan kuantitas santri dari waktu ke waktu.</p>",
            'location_html' => "<p>Pesantren ini telah berafiliasi dengan <strong>RMI (Rabithah Ma'had Al-Islamiyyah)</strong>, salah satu lembaga Nahdlatul Ulama (NU) yang membidangi asosiasi pesantren bermanhaj Ahlussunnah wal Jama'ah An-Nahdliyyah.</p>",
            'founder' => [
                'name' => 'KH. Muhammad Mubassyir Mundzir bin KH. Imam Bachri',
                'facts' => [
                    ['label' => 'Nama kecil', 'value' => 'Ibnu Mundzir'],
                    ['label' => 'Anak ke', 'value' => '5 dari 6 bersaudara'],
                    ['label' => 'Lahir', 'value' => 'Nganjuk, 11-06-1409 H / 1919 M'],
                    ['label' => 'Wafat', 'value' => '1989 M'],
                ],
                'bio_html' => '<p>Ketika masih dalam kandungan ibunya, ayah Gus Ib atau Mbah Mundzir, yaitu KH. Imam Bachri, bermimpi melihat seekor macan putih yang besar, gagah, dan penuh wibawa. Mimpi tersebut diyakini sebagai gambaran tentang Mbah Mundzir di masa hidupnya.</p>'
                    .'<p>Beliau dikenal sebagai sosok ulama yang zuhud, sangat disiplin, dan tegas dalam menerapkan serta mengamalkan ajaran agama Islam, serta ahli dalam menjaga shalat agar selalu istiqamah dilaksanakan secara berjamaah dan tepat waktu.</p>'
                    ."<p>Pada tahun 1967, Mbah Mundzir secara resmi memangku Ma'unah Sari, yang kemudian menjadi cikal bakal berdirinya Pondok Pesantren Ma'unah Sari. Sejak beliau mulai memangku Masjid Ma'unah Sari, para santri mulai berdatangan dan secara resmi nyantri kepada beliau.</p>",
            ],
            'caretaker' => [
                'period' => 'Pengasuh periode 1990 - sekarang',
                'name' => 'KH. R. Abdul Hamid Abdul Qodir',
                'lineage' => 'Lahir di Bantul, Krapyak, 30 April 1959 M. Putra dari KH. R. Abdul Qodir Munawwir & Nyai Hj. R. A. Salimah Nawawi.',
                'bio_html' => "<p>Beliau merupakan cucu dari KH. M. Munawwir, pendiri Pondok Pesantren Krapyak Yogyakarta. Beliau menempuh pendidikan formal selama 13 tahun di Krapyak, lalu meneruskan menghafal Al-Qur'an hingga khatam di Ponpes Sunan Pandan Aran, Sleman, Yogyakarta, di bawah asuhan KH. Mufid Mas'ud.</p>"
                    ."<p>Selanjutnya, beliau belajar di Ponpes Al-Falah Ploso, Kediri (1980-1985), lalu ke Ponpes Cidahu, Pandeglang, Banten (1985-1987) di bawah asuhan Abuya KH. Dimyati Amin. Beliau juga mendalami Qira'ah Sab'ah di bawah bimbingan KH. R. M. Najib Abdul Qodir. Sesuai wasiat KH. M. Mubassyir Mundzir sebelum wafat pada tahun 1989, tongkat estafet pengasuh diamanatkan kepada beliau.</p>",
                'works' => [
                    "Al-Ma'unah Fii Tafsiri Suratil Fatihah",
                    'Setetes Embun Penyejuk Hati: Biografi KH. M. Mubassyir Mundzir',
                    "Daftar Kandungan Al-Qur'an (Terjemah Fazlurrahman)",
                    "Buku Panduan Riyadloh Al-Qur'an \"41 Khataman\"",
                ],
                'organizations' => [
                    'Rais Syuriah PCNU Kota Kediri (2016-Sekarang)',
                    'Wakil Ketua MUI Kota Kediri (2021-Sekarang)',
                    'Salah Satu Pengasuh PP Al-Munawwir Krapyak (2022-Sekarang)',
                    'Mustasyar PWNU Yogyakarta (2024-Sekarang)',
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private static function pondokPutra(): array
    {
        return [
            'programs' => [
                ['title' => 'Bil-Hifdhi', 'description' => "Program khusus menghafal Al-Qur'an dengan sistem pengajian sorogan. Santri menyetorkan hafalan Al-Qur'an kepada Pengasuh atau Ustadz untuk disimak dan ditashih.", 'target' => 'Membentuk hafalan santri yang kuat, benar, dan sesuai kaidah tajwid.'],
                ['title' => 'Bin-Nadhor', 'description' => "Sistem pembelajaran sorogan membaca langsung dengan membawa mushaf Al-Qur'an di hadapan Pengasuh atau Ustadz untuk ditashih kualitas bacaannya.", 'target' => 'Fokus pada perbaikan, pemantapan, dan fashahah kualitas bacaan santri.'],
                ['title' => "Qira'ah Sab'ah", 'description' => "Program kajian perbandingan qira'at dari tujuh imam (Qurra' Sab'ah), diperuntukkan khusus bagi santri putra yang telah menyelesaikan setoran hafalan 30 juz secara lancar.", 'target' => "Memperluas wawasan keilmuan riwayat bacaan Al-Qur'an."],
                ['title' => 'Riyadloh', 'description' => "Program riyadloh spiritual mengkhatamkan Al-Qur'an satu kali sehari selama 41 hari berturut-turut. Terbuka setiap saat dengan kuota sangat terbatas (maksimal 5 santri putra).", 'target' => 'Mendekatkan diri secara batiniah pada keberkahan penjagaan kalamullah.'],
            ],
            'activities' => [
                ['time' => 'Setelah Subuh & Setelah Magrib', 'title' => 'Setoran Hafalan', 'description' => "Menyetorkan hafalan baru atau muroja'ah kepada Pengasuh atau Ustadz."],
                ['time' => '14:30 - 15:30 WIB', 'title' => 'Deresan Siang', 'description' => 'Mempersiapkan hafalan yang akan disetorkan.'],
                ['time' => '20:00 - 21:00 WIB', 'title' => 'Madrasah Diniyyah Al-Mundziriyyah', 'description' => 'Belajar menulis Pegon dan kajian kitab kuning (Kelas I & Kelas II).'],
            ],
            'facilities' => ['Kotak almari pribadi', 'Konsumsi makan 2x sehari'],
            'quota_note' => 'Kuota pendaftaran santri baru ditetapkan secara ketat berdasarkan jumlah kotak almari mukim yang masih kosong. Dianjurkan calon wali santri untuk terlebih dahulu menghubungi narahubung pesantren guna memastikan kuota sebelum sowan.',
        ];
    }

    /** @return array<string, mixed> */
    private static function pondokPutri(): array
    {
        return [
            'programs' => [
                ['title' => 'Bil-Hifdhi', 'description' => "Program menghafal Al-Qur'an dengan sistem pengajian sorogan. Santri menyetorkan hafalan Al-Qur'an langsung kepada Pengasuh atau Ustadzah untuk disimak dan ditashih.", 'target' => 'Membentuk hafalan santriwati yang mutqin (kuat), benar, dan sesuai kaidah tajwid.'],
                ['title' => 'Bin-Nadhor', 'description' => "Pembelajaran membaca Al-Qur'an secara bin-nadhor (melihat mushaf) dengan sistem sorogan di hadapan Pengasuh atau Ustadzah guna membenarkan makhraj dan kelancaran.", 'target' => 'Fashahah dan kelancaran bacaan sebelum memulai hafalan baru.'],
                ['title' => "Qira'ah Sab'ah", 'description' => "Kajian perbandingan riwayat bacaan Al-Qur'an dari tujuh imam qira'at utama, dikhususkan untuk santriwati yang telah mengkhatamkan setoran hafalan Al-Qur'an 30 juz.", 'target' => 'Menguasai perbedaan bacaan mutawatir yang absah dari Rasulullah saw.'],
                ['title' => 'Riyadloh Berkala', 'description' => "Tadribul ibadah mengkhatamkan Al-Qur'an 30 juz satu kali sehari selama 41 hari. Dibuka secara berkala 3 bulan sekali dengan kuota maksimal 25 santriwati per gelombang.", 'target' => 'Penerimaan berkala yang dapat disesuaikan dengan kuota asrama yang tersedia.'],
            ],
            'activities' => [
                ['time' => '06:00 & 10:00 WIB', 'title' => 'Setoran Pagi & Siang', 'description' => "Penyetoran hafalan baru atau muroja'ah kepada mustami'/ustadzah."],
                ['time' => '20:00 - 21:00 WIB', 'title' => "Madrasah Diniyyah Ma'unah Sari Lil-Banat", 'description' => 'Pendidikan kitab kuning berjenjang (Kelas I sampai Kelas IV).'],
                ['time' => '21:30 - Selesai WIB', 'title' => 'Deresan Malam', 'description' => 'Mempersiapkan hafalan yang akan disetorkan keesokan harinya.'],
            ],
            'facilities' => ['Kotak almari pribadi', 'Konsumsi makan 2x sehari'],
            'quota_note' => 'Kuota pendaftaran santriwati baru ditetapkan berdasarkan jumlah kotak almari asrama putri yang tersedia. Sangat dianjurkan calon wali santriwati untuk berkoordinasi terlebih dahulu dengan narahubung putri sebelum menjadwalkan kunjungan.',
        ];
    }

    /** @return array<string, mixed> */
    private static function contact(): array
    {
        return [
            'address' => 'Jl. KH. Agus Salim No.8, Bandar Kidul, Kec. Mojoroto, Kota Kediri, Jawa Timur 64118',
            'affiliation' => "Lembaga pendidikan Tahfidhul Qur'an berafiliasi dengan Rabithah Ma'had Al-Islamiyyah (RMI) Nahdlatul Ulama yang mendidik santri putra-putri berwawasan Ahlussunnah wal Jama'ah An-Nahdliyyah.",
            'contacts' => [
                ['role' => 'Kantor Putra', 'phone' => '0812-4530-6020', 'description' => 'Informasi asrama putra, kuota almari santri baru putra, dan koordinasi sowan putra.'],
                ['role' => 'Kantor Putri', 'phone' => '0856-4571-7767', 'description' => 'Informasi asrama putri, gelombang riyadloh berkala 3 bulanan, dan koordinasi sowan putri.'],
            ],
            'social' => [
                ['name' => 'Instagram', 'handle' => '@maunahsari', 'href' => 'https://www.instagram.com/maunahsari'],
                ['name' => 'Facebook', 'handle' => 'PP Maunah Sari', 'href' => 'https://www.facebook.com/ppmaunahsari'],
                ['name' => 'TikTok', 'handle' => '@maunahsari', 'href' => 'https://www.tiktok.com/@maunahsari'],
                ['name' => 'YouTube', 'handle' => "Tahfidhul Qur'an Ma'unah Sari", 'href' => 'https://www.youtube.com/channel/UCH3bNfhbfEJpPjm9gfGvvSQ'],
            ],
            'magazine_url' => 'https://khobarunamaunahsari.blogspot.com/',
        ];
    }
}
