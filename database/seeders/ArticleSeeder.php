<?php

namespace Database\Seeders;

use App\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\UserRole;
use Illuminate\Database\Seeder;

/**
 * Artikel awal dari konten situs maunahsari.com: pendaftaran, profil pesantren,
 * pengasuh, program dan kegiatan, serta narahubung. Artikel yang sudah ada tidak
 * ditimpa agar suntingan pengurus tetap utuh.
 */
class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::query()->where('role', UserRole::Admin)->orderBy('id')->first();
        if ($author === null) {
            return;
        }
        foreach ($this->categories() as [$name, $slug]) {
            Category::firstOrCreate(['slug' => $slug], ['name' => $name]);
        }
        foreach ($this->tags() as [$name, $slug]) {
            Tag::firstOrCreate(['slug' => $slug], ['name' => $name]);
        }
        foreach ($this->articles() as $data) {
            $categorySlugs = $data['categories'];
            $tagSlugs = $data['tags'];
            unset($data['categories'], $data['tags']);
            $article = Article::withTrashed()->firstOrCreate(['slug' => $data['slug']], [
                ...$data,
                'status' => ArticleStatus::Published,
                'author_id' => $author->id,
            ]);
            $article->categories()->syncWithoutDetaching(Category::whereIn('slug', $categorySlugs)->pluck('id')->all());
            $article->tags()->syncWithoutDetaching(Tag::whereIn('slug', $tagSlugs)->pluck('id')->all());
        }
    }

    /** @return array<int, array{string, string}> */
    private function categories(): array
    {
        return [
            ['Kabar Pesantren', 'kabar-pesantren'],
            ['Pendaftaran', 'pendaftaran'],
            ['Profil Pesantren', 'profil-pesantren'],
            ['Program', 'program'],
        ];
    }

    /** @return array<int, array{string, string}> */
    private function tags(): array
    {
        return [
            ['Pesantren', 'pesantren'],
            ['Pendaftaran', 'pendaftaran'],
            ['Profil', 'profil'],
            ['Program', 'program'],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function articles(): array
    {
        return [
            [
                'title' => 'Pendaftaran Santri Baru 2026/2027',
                'slug' => 'pendaftaran-santri-baru-2026-2027',
                'excerpt' => 'Pesantren Tahfidzul Qur’an Ma’unah Sari membuka pendaftaran santri baru tahun 2026/2027 bagi santri putra dan putri, secara daring maupun luring hingga kuota terpenuhi.',
                'content' => <<<'HTML'
<p>Pesantren Tahfidzul Qur’an Ma’unah Sari dengan ini membuka Pendaftaran Santri Baru Tahun 2026/2027 bagi santri putra dan putri. Proses pendaftaran dapat dilakukan secara daring (online) maupun luring (offline), dan akan ditutup sewaktu-waktu apabila kuota telah terpenuhi.</p>
<h2>Ketentuan pendaftaran</h2>
<ul>
<li>Pendaftaran dapat dilakukan secara daring (online) maupun luring (offline).</li>
<li>Calon santri atau wali yang berencana hadir secara langsung diharapkan melakukan konfirmasi terlebih dahulu kepada narahubung yang tertera.</li>
<li>Khusus pendaftaran santri nduduk (putra), dapat dilakukan dengan datang langsung ke kantor pondok.</li>
</ul>
<h2>Alur pendaftaran</h2>
<ol>
<li>Calon santri mengisi formulir pendaftaran secara daring sesuai dengan ketentuan yang telah disediakan.</li>
<li>Calon santri hadir di pondok pesantren pada waktu yang telah ditentukan oleh pihak penyelenggara.</li>
<li>Calon santri melakukan penyelesaian biaya administrasi di kantor pondok pesantren.</li>
<li>Calon santri bersama orang tua atau wali melaksanakan sowan kepada pengasuh pondok sebagai bagian dari proses pendaftaran.</li>
</ol>
<h2>Syarat dan berkas pendaftaran</h2>
<ol>
<li>Calon santri mengisi formulir pendaftaran sesuai dengan ketentuan yang berlaku.</li>
<li>Calon santri wajib diantar oleh orang tua atau wali pada saat proses pendaftaran.</li>
<li>Menyerahkan fotokopi ijazah terakhir sebanyak 2 (dua) lembar.</li>
<li>Menyerahkan fotokopi Kartu Keluarga (KK) sebanyak 2 (dua) lembar.</li>
<li>Menyerahkan pas foto berwarna ukuran 3x4 sebanyak 2 (dua) lembar.</li>
<li>Menyerahkan nomor kontak orang tua atau wali yang dapat dihubungi.</li>
<li>Calon santri bersedia untuk taat dan patuh terhadap seluruh peraturan yang berlaku di pondok pesantren.</li>
</ol>
<h2>Rincian biaya dan formulir</h2>
<ul>
<li><a href="https://drive.google.com/file/d/1Sfs6EcAzYpryACiCOrx4sXUWYtY46C3Q/view?usp=sharing">Rincian biaya pondok putra</a></li>
<li><a href="https://drive.google.com/file/d/1FYcClryJVb7sqIb8Ph2XhZFAwNRxR6H3/view?usp=drive_link">Rincian biaya pondok putri</a></li>
<li><a href="https://forms.gle/5ZkMT3buNXGpgRHX6">Formulir pendaftaran putra</a></li>
<li><a href="https://forms.gle/mr9fBiMJHQQMfrPC9">Formulir pendaftaran putri</a></li>
</ul>
HTML,
                'categories' => ['pendaftaran', 'kabar-pesantren'],
                'tags' => ['pendaftaran', 'pesantren'],
                'published_at' => now()->subDays(3),
            ],
            [
                'title' => 'Sejarah Berdiri Pesantren Tahfidhul Qur’an Ma’unah Sari',
                'slug' => 'sejarah-berdiri-pesantren-tahfidhul-quran-maunah-sari',
                'excerpt' => 'Didirikan pada tahun 1967 M oleh KH. M. Mubassyir Mundzir, PTQ Ma’unah Sari tumbuh dari majelis tashawwuf menjadi pesantren tahfidhul Qur’an di Kota Kediri.',
                'content' => <<<'HTML'
<p>Pesantren Tahfidhul Qur’an Ma’unah Sari merupakan lembaga pendidikan Islam di Kota Kediri yang didirikan pada tahun 1967 M oleh Simbah KH. M. Mubassyir Mundzir bin KH. M. Imam Bachri. Nasab beliau, jika dirunut, bersambung hingga Rasulullah saw. melalui jalur Sayyidina Husain.</p>
<p>Secara geografis, PTQ Ma’unah Sari terletak di sebelah barat Sungai Brantas, beralamat Jl. KH. Agus Salim No. 08 Bandar Kidul, Mojoroto, Kota Kediri, Jawa Timur 64118. Pesantren ini telah berafiliasi dengan RMI (Rabithah Ma’had Al-Islamiyyah), salah satu lembaga NU (Nahdlatul Ulama) yang membidangi asosiasi pesantren bermanhaj Ahlussunah wal Jama’ah Annahdhiyyah.</p>
<p>Pada masa awal perkembangannya, pesantren ini lebih mengkhususkan pada bidang tashawwuf, terutama mengistiqamahkan sholat berjamaah, wirid, dan dzikir. Seiring berjalannya waktu, pesantren bertransformasi menjadi Pesantren Tahfidhul Qur’an dengan hadirnya Simbah Nyai Hj. Zuhriyyah Munawwir Al-Hafizhoh binti Al-Muqri Al-Hafidz KH. R. Munawwir Krapyak Yogyakarta, yang menjadi istri muassis PTQ Ma’unah Sari pada tahun 1973.</p>
<p>Eksistensi beliau menambah corak Qur’ani dalam lingkup pesantren yang awalnya lebih bertendensi kepada ranah tashawwuf, tanpa memudarkan nilai-nilai spiritual tashawwuf tersebut. Keberadaan keluarga harmonis ini menambah corak pendidikan pesantren, sehingga kualitas dan kuantitas santri PTQ Ma’unah Sari terus bertambah dari waktu ke waktu.</p>
<h2>Lokasi</h2>
<p>Jl. KH. Agus Salim No. 08, Bandar Kidul, Kecamatan Mojoroto, Kota Kediri, Jawa Timur 64118.</p>
HTML,
                'categories' => ['profil-pesantren'],
                'tags' => ['profil', 'pesantren'],
                'published_at' => now()->subDays(21),
            ],
            [
                'title' => 'KH. R. Abdul Hamid Abdul Qodir, Pengasuh PTQ Ma’unah Sari',
                'slug' => 'kh-r-abdul-hamid-abdul-qodir-pengasuh-ptq-maunah-sari',
                'excerpt' => 'Cucu KH. Munawwir Krapyak yang menghafal Al-Qur’an dan menguasai Qira’ah Sab’ah, mengasuh PTQ Ma’unah Sari sejak 1990 hingga sekarang.',
                'content' => <<<'HTML'
<p>KH. R. Abdul Hamid Abdul Qodir memiliki nama lengkap KH. R. Abdul Hamid bin KH. Abdul Qodir bin KH. M. Munawwir bin KH. Abdullah Rosyad bin KH. Hasan Bashori. Lahir pada 30 April 1959 M di Krapyak, Bantul, Yogyakarta, beliau merupakan putra pasangan KH. R. Abdul Qodir Munawwir dan Nyai Hj. R. A. Salimah Nawawi, serta cucu dari KH. Munawwir, pendiri Pondok Pesantren Krapyak Yogyakarta.</p>
<p>Dalam urutan keluarga, beliau adalah putra keempat dari lima bersaudara dan dilahirkan dari keluarga pesantren. Pada tahun 1989, KH. R. Abdul Hamid Abdul Qodir menikah dengan Nyai Hj. Luluk Maftuhah, putri KH. Abdullah Faqih Dahlan Malang. Dari pernikahan tersebut beliau dikaruniai empat putra dan dua putri.</p>
<h2>Perjalanan keilmuan</h2>
<p>Pendidikan formal beliau ditempuh selama 13 tahun di Krapyak, mulai dari TK Ndasari Budi Krapyak Kulon tahun 1965 hingga 1966, SD Jageran Krapyak Kulon serta Madrasah Ibtidaiyah Ponpes Krapyak Yogyakarta hingga tamat tahun 1972, lalu MTs dan Aliyah Al-Munawwir tahun 1973 sampai 1978. Pada tahun 1979 beliau menghafal Al-Qur’an hingga khatam di Ponpes Sunan Pandan Aran Sleman, asuhan KH. Mufid Mas’ud.</p>
<p>Tahun 1980 beliau menambah wawasan di Pondok Pesantren Al-Falah Ploso, Mojo, Kediri sebagai santri musyawirin hingga 1985, sekaligus menjadi santri di PTQ Ma’unah Sari Bandar Kidul. Selanjutnya beliau melanjutkan di Ponpes Raudlotul Ulum Cidahu, Pandeglang, Banten pada 1985 sampai 1987 di bawah asuhan Abuya KH. M. Dimyati Amin. Setelah belajar di Banten, beliau kembali ke Krapyak untuk belajar Qira’ah Sab’ah kepada kakaknya, KH. R. Muhammad Najib Abdul Qodir, pada tahun 1987 sampai 1988.</p>
<h2>Pengasuh PTQ Ma’unah Sari</h2>
<p>Pada 19 Januari 1989, pendiri PTQ Ma’unah Sari KH. Mubassyir Mundzir wafat. Sebelum wafat, karena belum dikaruniai keturunan, beliau memberikan wasiat terkait regenerasi pengasuh pesantren. Sesuai wasiat tersebut, tongkat estafet pengasuh diamanatkan kepada KH. Abdul Hamid Abdul Qodir.</p>
<p>KH. Abdul Hamid merupakan seorang penghafal Al-Qur’an dan menguasai Qira’ah Sab’ah, sehingga cita-cita pendiri yang menginginkan PTQ Ma’unah Sari berkembang menjadi tempat para santri menghafal Al-Qur’an dapat tercapai. Di samping mengasuh PTQ Ma’unah Sari, sejak tahun 2022 beliau juga menjadi salah satu pengasuh Pondok Pesantren Al-Munawwir Krapyak Yogyakarta.</p>
<h2>Karya dan kegiatan</h2>
<ul>
<li>Al Ma’unah Fii Tafsiri Surotil Fatihah.</li>
<li>Setetes Embun Penyejuk Hati: Biografi KH. M. Mubassyir Mundzir, diterbitkan PPTQ Ma’unah Sari tahun 2002.</li>
<li>Daftar Kandungan Al-Qur’an, terjemah dari “Subject Index of the Holy al-Qur’an” karya Dr. Fazlurrahman.</li>
<li>Buku Panduan Riyadloh Al-Qur’an “41 khataman”.</li>
<li>Setengah Abad Kepergian Ayahanda Tercinta KH. R. Abdul Qadir Munawwir.</li>
</ul>
<p>Beliau juga aktif di lembaga keagamaan dan kemasyarakatan, antara lain sebagai salah satu pendiri PESSAKARTA (Pergerakan Santri Seluruh Yogyakarta), Ketua Dewan Syuro DPC PKB Kota Kediri selama dua periode, Rais Syuriah PCNU Kota Kediri sejak 2016, Wakil Ketua MUI Kota Kediri sejak 2021, salah satu pimpinan BAZNAS Kota Kediri sejak 2021, serta Mustasyar PWNU Yogyakarta sejak 2024.</p>
HTML,
                'categories' => ['profil-pesantren'],
                'tags' => ['profil', 'pesantren'],
                'published_at' => now()->subDays(14),
            ],
            [
                'title' => 'Program dan Kegiatan Santri PTQ Ma’unah Sari',
                'slug' => 'program-dan-kegiatan-santri-ptq-maunah-sari',
                'excerpt' => 'Empat program pendidikan Al-Qur’an — Bil-Hifdhi, Bin-Nadhor, Qira’ah Sab’ah, dan Riyadloh — didampingi setoran, deresan, serta Madrasah Diniyyah.',
                'content' => <<<'HTML'
<p>Pembelajaran Al-Qur’an di Pesantren Tahfidzul Qur’an Ma’unah Sari diselenggarakan melalui empat program, yaitu Bil-Hifdhi, Bin-Nadhor, Qira’ah Sab’ah, dan Riyadloh. Program-program tersebut dilengkapi kegiatan harian setoran, deresan, dan Madrasah Diniyyah.</p>
<h2>Program</h2>
<h3>Bil-Hifdhi</h3>
<p>Program khusus bagi santri yang berkeinginan menghafal Al-Qur’an dengan sistem pengajian sorogan. Santri menyetorkan hafalan kepada pengasuh atau ustadz untuk disimak dan ditashih bacaan serta hafalannya, sehingga terbentuk hafalan yang kuat, benar, dan sesuai kaidah bacaan Al-Qur’an.</p>
<h3>Bin-Nadhor</h3>
<p>Memiliki sistem pembelajaran yang sama dengan Bil-Hifdhi, dengan satu perbedaan utama: ketika penyimakan berlangsung, santri membawa mushaf dan membaca secara langsung untuk didengarkan serta ditashih bacaannya. Program ini difokuskan pada perbaikan dan pemantapan kualitas bacaan Al-Qur’an.</p>
<h3>Qira’ah Sab’ah</h3>
<p>Pesertanya adalah santri yang telah menyelesaikan hafalan Al-Qur’an secara keseluruhan, dengan prioritas santri yang hafalannya benar-benar lancar. Materi pembelajarannya berupa kajian perbandingan bacaan Al-Qur’an menurut satu imam dengan bacaan imam lain yang masyhur, berjumlah tujuh imam qira’at (Qurra’ Sab’ah).</p>
<h3>Riyadloh</h3>
<p>Diperuntukkan bagi santri yang telah hafal Al-Qur’an secara sempurna, dengan kemungkinan bagi santri yang belum menyelesaikan hafalan untuk mengikutinya dengan ketentuan tertentu. Riyadloh dilaksanakan dengan mengkhatamkan Al-Qur’an satu kali setiap hari selama 41 hari. Penerimaan santri Riyadloh putra dibuka setiap saat dengan kuota terbatas lima orang, sedangkan Riyadloh putri dibuka berkala setiap tiga bulan dengan kuota maksimal 25 santri.</p>
<h2>Kegiatan harian</h2>
<ul>
<li><strong>Setoran.</strong> Santri putra menyetorkan hafalan pada pagi hari setelah Subuh dan sore hari setelah Magrib, sedangkan santri putri pada pukul 06.00 dan 10.00. Seluruh santri menyetorkan hafalan kepada mustami masing-masing sesuai pembagian yang ditetapkan.</li>
<li><strong>Deresan.</strong> Santri putra berderesan pada pukul 14.30 sampai 15.30, sedangkan santri putri pada pukul 21.30 hingga selesai, sebagai persiapan hafalan yang akan disetorkan.</li>
<li><strong>Madrasah Diniyyah.</strong> Dilaksanakan setelah salat Isya, pukul 20.00 sampai 21.00. Madrasah Diniyyah Al Mundziriyyah putra terdiri atas Kelas I dan Kelas II, sedangkan Madrasah Diniyyah Ma’unah Sari Lil-Banat terdiri atas Kelas I sampai Kelas IV.</li>
</ul>
HTML,
                'categories' => ['program'],
                'tags' => ['program', 'pesantren'],
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'Narahubung dan Media Sosial Pesantren',
                'slug' => 'narahubung-dan-media-sosial-pesantren',
                'excerpt' => 'Kontak kantor putra dan putri, alamat pesantren, serta kanal media sosial resmi PTQ Ma’unah Sari.',
                'content' => <<<'HTML'
<p>Untuk informasi pendaftaran dan layanan pesantren, silakan menghubungi narahubung berikut terlebih dahulu sebelum datang ke pondok.</p>
<h2>Narahubung</h2>
<ul>
<li>Kantor Putra: <a href="https://wa.me/+6281245306020">0812-4530-6020</a></li>
<li>Kantor Putri: <a href="https://wa.me/+6285645717767">0856-4571-7767</a></li>
</ul>
<h2>Media sosial</h2>
<ul>
<li><a href="https://www.facebook.com/ppmaunahsari">Facebook ppmaunahsari</a></li>
<li><a href="https://www.instagram.com/maunahsari">Instagram @maunahsari</a></li>
<li><a href="https://www.tiktok.com/@maunahsari">TikTok @maunahsari</a></li>
<li><a href="https://www.youtube.com/channel/UCH3bNfhbfEJpPjm9gfGvvSQ">Kanal YouTube Ma’unah Sari</a></li>
<li><a href="https://khobarunamaunahsari.blogspot.com/">Majalah Ma’unah Sari</a></li>
</ul>
<h2>Alamat</h2>
<p>Jl. KH. Agus Salim No. 08, Bandar Kidul, Kecamatan Mojoroto, Kota Kediri, Jawa Timur 64118.</p>
HTML,
                'categories' => ['kabar-pesantren'],
                'tags' => ['pesantren'],
                'published_at' => now()->subDay(),
            ],
        ];
    }
}
