<?php

namespace Database\Seeders;

use App\AdminRole;
use App\Models\AlumniProfile;
use App\Models\Program;
use App\Models\Regency;
use App\Models\User;
use App\Services\AlumniMapCache;
use App\UserRole;
use Database\Seeders\Concerns\IndonesianNames;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Data alumni realistis untuk pengembangan: nama, angkatan, domisili, profesi, dan
 * pilihan privasi yang masuk akal. Seluruhnya fiktif dan deterministik (tanpa acak),
 * sehingga hasilnya sama di setiap mesin. Hanya berjalan di local/testing.
 *
 * Akun masuk: alumni-admin@example.test (admin), alumni-demo-1@example.test (alumni
 * terverifikasi dengan peta dan direktori aktif). Kata sandi akun baru: "password".
 */
class AlumniDemoSeeder extends Seeder
{
    use IndonesianNames;

    /** Kode kota/kabupaten (Kemendagri) dan jumlah alumni; sebaran berekor panjang seperti pesantren sungguhan. */
    private const REGIONS = [
        '3571' => 26, '3506' => 17, '3578' => 14, '3573' => 11, '3471' => 8, '3517' => 8, '3518' => 7,
        '3504' => 6, '3515' => 6, '3572' => 5, '3273' => 5, '3374' => 5, '3174' => 5, '3510' => 4,
        '3671' => 4, '3505' => 3, '3171' => 3, '3275' => 3, '3276' => 3, '1271' => 3, '7371' => 3,
        '3519' => 3, '3577' => 2, '3507' => 2, '1671' => 2, '1471' => 2, '6471' => 2, '5271' => 2,
        '3509' => 1, '1371' => 1, '1871' => 1, '6171' => 1, '6371' => 1, '5171' => 1, '7471' => 1,
    ];

    /** @var array<string, list<array{0: string, 1: string, 2: list<string>}>> profesi, bidang, tempat per aktivitas */
    private const CAREERS = [
        'bekerja' => [
            ['Guru Tahfidz', 'Pendidikan', ['SDIT Nurul Qur’an', 'SMPIT Al-Hikmah', 'Madrasah Tsanawiyah Negeri', 'Rumah Tahfidz Al-Ikhlas']],
            ['Dosen', 'Pendidikan Tinggi', ['Institut Agama Islam Negeri', 'Universitas Muhammadiyah', 'Sekolah Tinggi Ilmu Tarbiyah']],
            ['Perawat', 'Kesehatan', ['RS Muhammadiyah', 'Puskesmas Kecamatan', 'RSUD Kota']],
            ['Staf Perbankan Syariah', 'Keuangan', ['Bank Syariah Nusantara', 'BPRS Barokah', 'Koperasi Syariah Sejahtera']],
            ['Pengembang Perangkat Lunak', 'Teknologi Informasi', ['PT Karya Digital Mandiri', 'Startup Edukasi Nusa', 'PT Solusi Teknologi Prima']],
            ['Akuntan', 'Keuangan', ['Kantor Akuntan Publik Amanah', 'PT Sinar Makmur']],
            ['Apoteker', 'Kesehatan', ['Apotek Sehat Sentosa', 'RS Islam']],
            ['Staf Administrasi', 'Perkantoran', ['Kantor Kecamatan', 'PT Agro Lestari', 'Yayasan Pendidikan Islam']],
            ['Jurnalis', 'Media', ['Radio Dakwah FM', 'Portal Berita Daerah']],
        ],
        'wirausaha' => [
            ['Pemilik Usaha Busana Muslim', 'Perdagangan', ['Butik Hijab Azzahra', 'Toko Busana Barokah']],
            ['Pengusaha Kuliner', 'Makanan dan Minuman', ['Warung Makan Berkah', 'Kedai Kopi Santri']],
            ['Pemilik Percetakan', 'Jasa', ['Percetakan Mitra Grafika', 'Digital Printing Cahaya']],
            ['Peternak', 'Pertanian dan Peternakan', ['Peternakan Kambing Barokah', 'Tani Mandiri']],
            ['Pengelola Toko Daring', 'Perdagangan', ['Toko Online Santri Mart', 'Lapak Halal Nusantara']],
        ],
        'studi' => [
            ['Mahasiswa S1', 'Pendidikan Agama Islam', ['Universitas Islam Negeri', 'Institut Agama Islam Negeri']],
            ['Mahasiswa S1', 'Kedokteran dan Kesehatan', ['Universitas Negeri', 'Universitas Muhammadiyah']],
            ['Mahasiswa S1', 'Teknik dan Informatika', ['Institut Teknologi', 'Universitas Brawijaya']],
            ['Mahasiswa S2', 'Ilmu Al-Qur’an dan Tafsir', ['Pascasarjana UIN', 'Institut Ilmu Al-Qur’an']],
        ],
        'mengabdi' => [
            ['Ustadz Pengajar', 'Pendidikan Pesantren', ['Pondok Pesantren Tahfidz', 'Madrasah Diniyah']],
            ['Imam dan Pengurus Masjid', 'Keagamaan', ['Masjid Jami’ Al-Falah', 'Masjid Baitul Muttaqin']],
            ['Guru TPQ', 'Pendidikan Nonformal', ['TPQ Nurul Huda', 'TPQ Darul Qur’an']],
        ],
        'lainnya' => [
            ['Ibu Rumah Tangga', 'Keluarga', []],
            ['Pencari Kerja', 'Umum', []],
        ],
    ];

    private const SKILLS = ['Tahfidz', 'Qira’at', 'Mengajar', 'Public Speaking', 'Kaligrafi', 'Desain Grafis', 'Pemrograman', 'Akuntansi', 'Manajemen Organisasi', 'Penulisan', 'Bahasa Arab', 'Bahasa Inggris', 'Kewirausahaan', 'Pemasaran Digital'];

    private const OPEN_TO = ['ready_to_help', 'mentoring', 'seeking_job', 'hiring'];

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $this->call(AlumniRegionSeeder::class);
        $admin = $this->admin();
        $regencies = Regency::whereIn('code', array_keys(self::REGIONS))->get()->keyBy('code');
        $missing = array_diff(array_keys(self::REGIONS), $regencies->keys()->all());
        if ($missing !== []) {
            throw new RuntimeException('Data wilayah belum lengkap ('.implode(', ', $missing).'). Jalankan AlumniRegionSeeder terlebih dahulu.');
        }
        $programs = Program::orderBy('sort_order')->pluck('id')->map(fn ($id): int => (int) $id)->all();
        $programs = array_values($programs);
        $password = Hash::make('password');
        $names = [];

        AlumniProfile::withoutEvents(function () use ($regencies, $programs, $password, $admin, &$names): void {
            foreach ($this->regionAssignments() as $index => $code) {
                $this->seedAlumnus($index + 1, $regencies->get($code) ?? throw new RuntimeException('Wilayah '.$code.' tidak ditemukan.'), $programs, $password, $admin, $names);
            }
        });
        AlumniMapCache::invalidate();
    }

    private function admin(): User
    {
        $admin = User::firstOrNew(['email' => 'alumni-admin@example.test']);
        if (! $admin->exists) {
            $admin->fill(['name' => 'Admin Alumni', 'password' => 'password']);
        }
        $admin->forceFill(['email_verified_at' => now()]);
        $admin->assignStaffRole(AdminRole::Admin);

        return $admin;
    }

    /**
     * Daftar kode wilayah per alumnus, diacak secara deterministik agar kota besar dan kecil
     * bercampur. Alumnus pertama selalu di Kota Kediri supaya akun demo utama punya rekan sekota.
     *
     * @return list<string>
     */
    private function regionAssignments(): array
    {
        $pairs = [];
        foreach (self::REGIONS as $code => $count) {
            for ($i = 0; $i < $count; $i++) {
                $pairs[] = [crc32('r'.$code.'-'.$i), (string) $code];
            }
        }
        usort($pairs, fn (array $a, array $b): int => $a[0] <=> $b[0]);
        $codes = array_map(fn (array $pair): string => $pair[1], $pairs);
        $first = (int) array_search('3571', $codes, true);
        [$codes[0], $codes[$first]] = [$codes[$first], $codes[0]];

        return array_values($codes);
    }

    /**
     * @param  list<int>  $programs
     * @param  array<string, true>  $names
     */
    private function seedAlumnus(int $number, Regency $regency, array $programs, string $password, User $admin, array &$names): void
    {
        $male = $this->roll('gender', $number, 100) < 52;
        $entryYear = 2008 + $this->roll('entry', $number, 14);
        $status = $this->pick('status', $number, ['lulus', 'lulus', 'lulus', 'lulus', 'lulus', 'lulus', 'lulus', 'lulus', 'keluar', 'mengabdi']);
        $leaveYear = $status === 'mengabdi' ? null : min(2026, $entryYear + 3 + $this->roll('stay', $number, 4));
        $activity = $this->activity($number, $leaveYear ?? 2020);
        [$profession, $field, $places] = $this->pick('career', $number, self::CAREERS[$activity]);
        $verification = $number === 1 ? 'approved' : $this->verification($number);
        $source = $number === 1 ? 'self' : $this->pick('source', $number, ['self', 'self', 'self', 'self', 'self', 'self', 'self', 'import', 'import', 'admin']);
        $privacy = $this->privacy($number, $verification, $source);

        $name = $this->fullName($number, $male, $names);
        $user = null;
        if ($source === 'self') {
            $user = User::firstOrCreate(['email' => 'alumni-demo-'.$number.'@example.test'], ['name' => $name, 'password' => $password]);
            $user->role = UserRole::Alumni;
            $user->forceFill(['name' => $name, 'email_verified_at' => now()])->save();
        }

        $phone = '628125550'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);

        AlumniProfile::unguarded(fn () => AlumniProfile::updateOrCreate(
            $user !== null ? ['user_id' => $user->id] : ['phone_whatsapp' => $phone],
            [
                'user_id' => $user?->id,
                'phone_whatsapp' => $phone,
                'full_name' => $name,
                'gender' => $male ? 'male' : 'female',
                'entry_year' => $entryYear,
                'leave_year' => $leaveYear,
                'pondok' => $male ? 'putra' : 'putri',
                'program_id' => $this->roll('program', $number, 100) < 80 ? $this->pick('programid', $number, $programs) : null,
                'alumni_status' => $status,
                'angkatan' => (string) $entryYear,
                'province_id' => $regency->province_id,
                'regency_id' => $regency->id,
                'activity_status' => $activity,
                'profession' => $profession,
                'organization' => $places === [] ? null : $this->pick('org', $number, $places),
                'field' => $field,
                'skills' => $this->skills($number),
                'bio' => $this->bio($activity, $profession, $regency, $entryYear),
                'open_to' => $this->openTo($number, $activity),
                'verification_status' => $verification,
                'verified_at' => $verification === 'pending' ? null : now()->subDays(5 + $this->roll('verified', $number, 300)),
                'verified_by' => $verification === 'pending' ? null : $admin->id,
                'rejection_reason' => $verification === 'rejected' ? 'Data angkatan belum dapat dicocokkan dengan arsip pesantren.' : null,
                'map_mode' => $privacy['map_mode'],
                'directory_visible' => $privacy['directory_visible'],
                'field_visibility' => $privacy['field_visibility'],
                'source' => $source,
                'claimed_at' => null,
            ],
        ));
    }

    private function activity(int $number, int $leftIn): string
    {
        $recent = $leftIn >= 2023;
        $options = $recent
            ? ['studi', 'studi', 'studi', 'studi', 'bekerja', 'bekerja', 'mengabdi', 'wirausaha', 'lainnya']
            : ['bekerja', 'bekerja', 'bekerja', 'bekerja', 'wirausaha', 'wirausaha', 'studi', 'mengabdi', 'mengabdi', 'lainnya'];

        return $this->pick('activity', $number, $options);
    }

    private function verification(int $number): string
    {
        $roll = $this->roll('verification', $number, 100);

        return $roll < 86 ? 'approved' : ($roll < 94 ? 'pending' : 'rejected');
    }

    /**
     * @return array{map_mode: string|null, directory_visible: bool|null, field_visibility: array<string, string>}
     */
    private function privacy(int $number, string $verification, string $source): array
    {
        if ($number === 1) {
            return ['map_mode' => 'visible', 'directory_visible' => true, 'field_visibility' => $this->visibleFields($number, true)];
        }
        if ($source !== 'self' || $verification === 'pending') {
            return ['map_mode' => null, 'directory_visible' => null, 'field_visibility' => []];
        }
        if ($verification === 'rejected') {
            return ['map_mode' => 'hidden', 'directory_visible' => false, 'field_visibility' => []];
        }
        $roll = $this->roll('map', $number, 100);
        if ($roll < 72) {
            return ['map_mode' => 'visible', 'directory_visible' => $this->roll('directory', $number, 100) < 85, 'field_visibility' => $this->visibleFields($number)];
        }

        return $roll < 90
            ? ['map_mode' => 'anonymous', 'directory_visible' => false, 'field_visibility' => []]
            : ['map_mode' => 'hidden', 'directory_visible' => false, 'field_visibility' => []];
    }

    /** @return array<string, string> */
    private function visibleFields(int $number, bool $all = false): array
    {
        $fields = ['full_name', 'angkatan', 'regency', 'pondok', 'activity_status', 'profession', 'organization', 'field', 'skills', 'bio', 'open_to'];

        return collect($fields)
            ->filter(fn (string $field): bool => $all || in_array($field, ['full_name', 'angkatan', 'regency'], true) || $this->roll('vis'.$field, $number, 100) < 75)
            ->mapWithKeys(fn (string $field): array => [$field => 'alumni'])
            ->all();
    }

    /** @return list<string> */
    private function skills(int $number): array
    {
        $count = 2 + $this->roll('skillcount', $number, 2);
        $skills = [];
        for ($i = 0; count($skills) < $count; $i++) {
            $skill = $this->pick('skill'.$i, $number, self::SKILLS);
            if (! in_array($skill, $skills, true)) {
                $skills[] = $skill;
            }
        }

        return $skills;
    }

    /** @return list<string> */
    private function openTo(int $number, string $activity): array
    {
        $options = $activity === 'studi' ? ['ready_to_help', 'seeking_job'] : self::OPEN_TO;
        $open = [$this->pick('open0', $number, $options)];
        if ($this->roll('open1', $number, 100) < 40) {
            $open[] = $this->pick('open1b', $number, $options);
        }

        return array_values(array_unique($open));
    }

    private function bio(string $activity, string $profession, Regency $regency, int $entryYear): string
    {
        $city = ucwords(strtolower($regency->name));

        return match ($activity) {
            'bekerja' => "Alumni angkatan {$entryYear}. Saat ini berkhidmat sebagai {$profession} di {$city}. Senang berbagi pengalaman dan menyambung silaturahmi dengan sesama alumni.",
            'wirausaha' => "Alumni angkatan {$entryYear}. Menekuni usaha sebagai {$profession} di {$city}. Terbuka untuk kolaborasi dan berbagi pengalaman berwirausaha.",
            'studi' => "Alumni angkatan {$entryYear}. Sedang menempuh pendidikan di {$city} sambil menjaga hafalan Al-Qur’an. Ingin banyak belajar dari kakak-kakak alumni.",
            'mengabdi' => "Alumni angkatan {$entryYear}. Mengabdi sebagai {$profession} di {$city}, melanjutkan ilmu yang didapat selama di pesantren.",
            default => "Alumni angkatan {$entryYear}. Berdomisili di {$city} dan tetap menjaga tali silaturahmi dengan keluarga besar pesantren.",
        };
    }
}
