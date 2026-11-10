<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\ProgramQuota;
use App\Models\RegistrationPeriod;
use App\Pondok;
use Illuminate\Database\Seeder;

/**
 * Penerimaan Santri Baru 2026/2027 (sumber: maunahsari.com/pendaftaran-santri-baru-20262027
 * dan /narahubung). Pendaftaran ditutup sewaktu-waktu bila kuota terpenuhi, sehingga
 * `closes_at` dibiarkan kosong.
 */
class RegistrationPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(ProgramSeeder::class);
        $period = RegistrationPeriod::firstOrCreate(['name' => 'PSB 2026/2027'], [
            'academic_year' => '2026/2027',
            'is_open' => true,
            'opens_at' => now(),
            'closes_at' => null,
            'fee_url_putra' => 'https://drive.google.com/file/d/1Sfs6EcAzYpryACiCOrx4sXUWYtY46C3Q/view?usp=sharing',
            'fee_url_putri' => 'https://drive.google.com/file/d/1FYcClryJVb7sqIb8Ph2XhZFAwNRxR6H3/view?usp=drive_link',
            'contact_whatsapp_putra' => '6281245306020',
            'contact_whatsapp_putri' => '6285645717767',
            'info_note' => $this->infoNote(),
        ]);
        foreach (Program::orderBy('sort_order')->get() as $program) {
            foreach (Pondok::cases() as $pondok) {
                $capacity = $this->capacity($program->slug, $pondok);
                ProgramQuota::firstOrCreate(
                    ['registration_period_id' => $period->id, 'program_id' => $program->id, 'pondok' => $pondok],
                    ['capacity' => $capacity, 'is_open' => ! ($program->slug === 'riyadloh' && $pondok === Pondok::Putri)],
                );
            }
        }
    }

    /**
     * Kuota resmi hanya dipublikasikan untuk Riyadloh: lima santri putra dan maksimal 25
     * santri putri. Program lain memakai angka awal yang dapat disesuaikan pengurus.
     */
    private function capacity(string $programSlug, Pondok $pondok): int
    {
        if ($programSlug === 'riyadloh') {
            return $pondok === Pondok::Putra ? 5 : 25;
        }

        return 25;
    }

    private function infoNote(): string
    {
        return <<<'HTML'
<p>Pesantren Tahfidzul Qur’an Ma’unah Sari membuka Pendaftaran Santri Baru Tahun 2026/2027 bagi santri putra dan putri. Pendaftaran akan ditutup sewaktu-waktu apabila kuota telah terpenuhi.</p>
<ul>
<li>Pendaftaran dapat dilakukan secara daring (online) maupun luring (offline).</li>
<li>Calon santri atau wali yang berencana hadir langsung diharapkan melakukan konfirmasi terlebih dahulu kepada narahubung.</li>
<li>Khusus pendaftaran santri nduduk (putra), dapat dilakukan dengan datang langsung ke kantor pondok.</li>
</ul>
<h3>Alur pendaftaran</h3>
<ol>
<li>Calon santri mengisi formulir pendaftaran secara daring sesuai ketentuan yang disediakan.</li>
<li>Calon santri hadir di pondok pesantren pada waktu yang telah ditentukan penyelenggara.</li>
<li>Calon santri menyelesaikan biaya administrasi di kantor pondok pesantren.</li>
<li>Calon santri bersama orang tua atau wali melaksanakan sowan kepada pengasuh pondok.</li>
</ol>
<h3>Syarat dan berkas</h3>
<ol>
<li>Mengisi formulir pendaftaran sesuai ketentuan yang berlaku.</li>
<li>Wajib diantar oleh orang tua atau wali pada saat proses pendaftaran.</li>
<li>Menyerahkan fotokopi ijazah terakhir sebanyak 2 lembar.</li>
<li>Menyerahkan fotokopi Kartu Keluarga (KK) sebanyak 2 lembar.</li>
<li>Menyerahkan pas foto berwarna ukuran 3x4 sebanyak 2 lembar.</li>
<li>Menyerahkan nomor kontak orang tua atau wali yang dapat dihubungi.</li>
<li>Bersedia taat dan patuh terhadap seluruh peraturan pondok pesantren.</li>
</ol>
<h3>Fasilitas</h3>
<ul>
<li>Kotak almari.</li>
<li>Makan 2 kali sehari.</li>
</ul>
<p>Kuota pendaftaran ditetapkan berdasarkan jumlah kotak almari yang tersedia, sehingga calon santri atau wali dianjurkan menghubungi narahubung untuk memastikan ketersediaan kuota. Rincian biaya dan formulir pendaftaran tersedia melalui tautan di halaman ini.</p>
HTML;
    }
}
