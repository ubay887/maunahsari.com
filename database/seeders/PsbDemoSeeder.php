<?php

namespace Database\Seeders;

use App\Actions\Psb\RegistrationNumber;
use App\ApplicantSource;
use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;
use App\Models\ApplicantDocument;
use App\Models\ApplicantPayment;
use App\Models\ApplicantStatusHistory;
use App\Models\Program;
use App\Models\ProgramQuota;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Pondok;
use App\ResidenceType;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Database\Seeders\Concerns\IndonesianNames;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Data PSB realistis: tiga periode lampau yang sudah ditutup dan periode berjalan 2026/2027,
 * lengkap dengan pelamar berbagai status, riwayat status, berkas, dan pembayaran. Alamat
 * memakai kecamatan dan desa sungguhan dari data wilayah; nama dan NIK fiktif. Santri dibuat
 * oleh {@see SantriSeeder}. Hanya berjalan di local/testing.
 */
class PsbDemoSeeder extends Seeder
{
    use IndonesianNames;

    /** Kota/kabupaten asal santri; Kediri dan sekitarnya lebih sering. */
    private const CITIES = ['3571', '3571', '3506', '3506', '3573', '3517', '3518', '3504', '3578', '3572'];

    private const BIRTH_PLACES = ['Kediri', 'Nganjuk', 'Jombang', 'Tulungagung', 'Blitar', 'Malang', 'Surabaya', 'Madiun', 'Trenggalek', 'Sidoarjo'];

    private const SCHOOLS = [
        'SD/MI' => ['MI Nurul Huda', 'MI Miftahul Ulum', 'SDN 1', 'MI Al-Hidayah'],
        'SMP/MTs' => ['MTs Negeri 1', 'MTs Al-Ma’arif', 'SMP Negeri 2', 'MTs Darul Ulum'],
        'SMA/MA' => ['MA Negeri 1', 'SMA Negeri 3', 'MA Al-Falah', 'SMK Muhammadiyah'],
    ];

    /** Placeholder 1x1 PNG dan PDF terkecil agar tautan unduh berkas contoh tetap berfungsi. */
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    private const PDF = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n";

    /** @var array<int|string, array<int, \stdClass>> */
    private array $districts = [];

    /** @var array<int|string, array<int, \stdClass>> */
    private array $villages = [];

    /** @var array<string, int> penerimaan per periode, program, dan pondok untuk menjaga kuota */
    private array $accepted = [];

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $this->call(RegistrationPeriodSeeder::class);
        if (! User::where('role', 'admin')->exists()) {
            $this->call(DemoUserSeeder::class);
        }
        $admin = User::where('role', 'admin')->orderBy('id')->firstOrFail();
        $programs = Program::orderBy('sort_order')->get()->keyBy('slug');
        $names = [];

        foreach ($this->periods() as [$year, $count]) {
            $period = $this->period($year, $programs->values()->all());
            for ($i = 1; $i <= $count; $i++) {
                $this->seedApplicant($period, $programs->all(), $admin, $i, $names);
            }
        }
    }

    /** @return list<array{string, int}> */
    private function periods(): array
    {
        return [['2023/2024', 16], ['2024/2025', 18], ['2025/2026', 20], ['2026/2027', 44]];
    }

    /** @param array<int, Program> $programs */
    private function period(string $year, array $programs): RegistrationPeriod
    {
        $start = (int) substr($year, 0, 4);
        $current = RegistrationPeriod::where('academic_year', $year)->first();
        if ($current !== null) {
            return $current;
        }
        $period = RegistrationPeriod::create([
            'name' => 'PSB '.$year,
            'academic_year' => $year,
            'is_open' => false,
            'opens_at' => CarbonImmutable::createFromDate($start, 3, 1),
            'closes_at' => CarbonImmutable::createFromDate($start, 7, 15),
            'contact_whatsapp_putra' => '6281245306020',
            'contact_whatsapp_putri' => '6285645717767',
        ]);
        foreach ($programs as $program) {
            foreach (Pondok::cases() as $pondok) {
                ProgramQuota::create(['registration_period_id' => $period->id, 'program_id' => $program->id, 'pondok' => $pondok, 'capacity' => 25, 'is_open' => false]);
            }
        }

        return $period;
    }

    /**
     * @param  array<string, Program>  $programs
     * @param  array<string, true>  $names
     */
    private function seedApplicant(RegistrationPeriod $period, array $programs, User $admin, int $i, array &$names): void
    {
        $key = (int) substr($period->academic_year, 0, 4) * 1000 + $i;
        $start = (int) substr($period->academic_year, 0, 4);
        $current = $period->academic_year === '2026/2027';
        $male = $this->roll('p-gender', $key, 100) < 52;
        $pondok = $male ? Pondok::Putra : Pondok::Putri;
        $program = $this->program($period, $pondok, $key, $programs);
        $status = $this->status($period, $program, $pondok, $key, $current);
        $name = $this->fullName($key, $male, $names, 'psb');
        $age = 12 + $this->roll('p-age', $key, 5);
        $birth = CarbonImmutable::createFromDate($start - $age, 1 + $this->roll('p-month', $key, 12), 1 + $this->roll('p-day', $key, 28));
        $region = $this->region($key);
        $day = str_pad((string) ((int) $birth->format('d') + ($male ? 0 : 40)), 2, '0', STR_PAD_LEFT);
        $nik = $region['district'].$day.$birth->format('my').(string) (1000 + $this->roll('p-nik', $key, 8999));
        $createdAt = $current
            ? now()->subDays(2 + $this->roll('p-created', $key, 150))->setTime(8 + $this->roll('p-hour', $key, 10), $this->roll('p-min', $key, 60))
            : CarbonImmutable::createFromDate($start, 3, 5)->addDays($this->roll('p-created', $key, 110))->setTime(9, $this->roll('p-min', $key, 60));
        $education = $age <= 12 ? 'SD/MI' : ($age <= 15 ? 'SMP/MTs' : 'SMA/MA');
        $decided = in_array($status, [ApplicantStatus::Accepted, ApplicantStatus::Rejected], true);

        $applicant = Applicant::withTrashed()->where('registration_period_id', $period->id)->where('nik', $nik)->first();
        if ($applicant !== null) {
            return;
        }
        $applicant = Applicant::unguarded(fn () => Applicant::create([
            'registration_number' => app(RegistrationNumber::class)->next($period, $pondok),
            'registration_period_id' => $period->id,
            'program_id' => $program->id,
            'pondok' => $pondok,
            'residence_type' => $this->roll('p-res', $key, 100) < 72 ? ResidenceType::Mukim : ResidenceType::Nduduk,
            'source' => $this->roll('p-src', $key, 100) < 70 ? ApplicantSource::Online : ApplicantSource::Offline,
            'status' => $status,
            'nik' => $nik,
            'province_code' => $region['known'] ? substr($region['city'], 0, 2) : null,
            'city_code' => $region['known'] ? $region['city'] : null,
            'district_code' => $region['known'] ? $region['district'] : null,
            'village_code' => $region['known'] ? $region['village'] : null,
            'rt' => str_pad((string) (1 + $this->roll('p-rt', $key, 9)), 3, '0', STR_PAD_LEFT),
            'rw' => str_pad((string) (1 + $this->roll('p-rw', $key, 6)), 3, '0', STR_PAD_LEFT),
            'postal_code' => '64'.str_pad((string) $this->roll('p-post', $key, 999), 3, '0', STR_PAD_LEFT),
            'full_name' => $name,
            'nickname' => explode(' ', $name)[1] ?? null,
            'gender' => $male ? 'male' : 'female',
            'birth_place' => $this->pick('p-bplace', $key, self::BIRTH_PLACES),
            'birth_date' => $birth->toDateString(),
            'address' => 'RT '.$region['rt'].' RW '.$region['rw'].', Desa '.$region['village_name'].', Kec. '.$region['district_name'].', '.$region['city_name'],
            'last_education' => $education,
            'last_school' => $this->pick('p-school', $key, self::SCHOOLS[$education]).' '.ucwords(strtolower($region['village_name'])),
            'hafalan_juz' => $this->roll('p-juz', $key, 100) < 30 ? 0 : $this->roll('p-juz2', $key, 11),
            'can_read_binnadhor' => $this->roll('p-bin', $key, 100) < 65,
            'can_write_pegon' => $this->roll('p-pegon', $key, 100) < 35,
            'guardian_name' => $this->guardianName($name, $this->roll('p-gtype', $key, 100) < 70, $key),
            'guardian_relation' => $this->pick('p-grel', $key, ['Ayah', 'Ayah', 'Ayah', 'Ibu', 'Wali']),
            'guardian_phone' => '628125560'.str_pad((string) ($key % 1000), 3, '0', STR_PAD_LEFT),
            'agreed_to_rules' => true,
            'agreed_at' => $createdAt,
            'visit_scheduled_at' => in_array($status, [ApplicantStatus::Verified, ApplicantStatus::Accepted], true) ? $createdAt->copy()->addDays(10) : null,
            'visited_at' => $status === ApplicantStatus::Accepted ? $createdAt->copy()->addDays(10) : null,
            'sowan_done_at' => $status === ApplicantStatus::Accepted ? $createdAt->copy()->addDays(11) : null,
            'admin_note' => $this->roll('p-note', $key, 100) < 12 ? 'Orang tua meminta jadwal kunjungan di akhir pekan.' : null,
            'decision_reason' => match ($status) {
                ApplicantStatus::Rejected => 'Belum memenuhi persyaratan berkas dan kemampuan dasar membaca Al-Qur’an.',
                ApplicantStatus::Cancelled => 'Mengundurkan diri atas permintaan wali santri.',
                default => null,
            },
            'decided_at' => $decided ? $createdAt->copy()->addDays(14) : null,
            'decided_by' => $decided ? $admin->id : null,
            'created_at' => $createdAt,
            'updated_at' => $createdAt->copy()->addDays($decided ? 14 : 0),
        ]));

        $this->histories($applicant, $status, $admin, $createdAt);
        $this->documents($applicant, $status, $admin, $createdAt);
        $this->payments($applicant, $status, $admin, $createdAt);
    }

    /** @param array<string, Program> $programs */
    private function program(RegistrationPeriod $period, Pondok $pondok, int $key, array $programs): Program
    {
        $slug = $this->pick('p-program', $key, ['bil-hifdhi', 'bil-hifdhi', 'bil-hifdhi', 'bin-nadhor', 'bin-nadhor', 'bin-nadhor', 'qiraah-sabah', 'qiraah-sabah', 'riyadloh']);
        $quota = ProgramQuota::where('registration_period_id', $period->id)->where('program_id', $programs[$slug]->id)->where('pondok', $pondok)->first();
        if ($quota !== null && ! $quota->is_open && $period->is_open) {
            $slug = 'bin-nadhor';
        }

        return $programs[$slug];
    }

    private function status(RegistrationPeriod $period, Program $program, Pondok $pondok, int $key, bool $current): ApplicantStatus
    {
        $roll = $this->roll('p-status', $key, 100);
        $status = $current
            ? match (true) {
                $roll < 30 => ApplicantStatus::Registered,
                $roll < 54 => ApplicantStatus::Verified,
                $roll < 84 => ApplicantStatus::Accepted,
                $roll < 92 => ApplicantStatus::Rejected,
                default => ApplicantStatus::Cancelled,
            }
        : match (true) {
            $roll < 85 => ApplicantStatus::Accepted,
            $roll < 93 => ApplicantStatus::Rejected,
            default => ApplicantStatus::Cancelled,
        };
        if ($status !== ApplicantStatus::Accepted) {
            return $status;
        }
        $quota = ProgramQuota::where('registration_period_id', $period->id)->where('program_id', $program->id)->where('pondok', $pondok)->first();
        $bucket = $period->id.'-'.$program->id.'-'.$pondok->value;
        $this->accepted[$bucket] = ($this->accepted[$bucket] ?? 0);
        if ($quota !== null && $this->accepted[$bucket] >= $quota->capacity) {
            return ApplicantStatus::Verified;
        }
        $this->accepted[$bucket]++;

        return $status;
    }

    /**
     * Wilayah asal pelamar dari data kecamatan dan desa sungguhan. Bila tabel wilayah belum terisi
     * (mis. lingkungan uji), kode wilayah dikosongkan dan alamat memakai nama umum.
     *
     * @return array{known: bool, city: string, city_name: string, district: string, district_name: string, village: string, village_name: string, rt: string, rw: string}
     */
    private function region(int $key): array
    {
        $city = $this->pick('p-city', $key, self::CITIES);
        $this->districts[$city] ??= DB::table('indonesia_districts')->where('city_code', $city)->orderBy('code')->get()->all();
        if ($this->districts[$city] === []) {
            return ['known' => false, 'city' => $city, 'city_name' => 'Kediri', 'district' => $city.'01', 'district_name' => 'Mojoroto', 'village' => '', 'village_name' => 'Bandar Kidul', 'rt' => '001', 'rw' => '001'];
        }
        $district = $this->pick('p-district', $key, $this->districts[$city]);
        $this->villages[$district->code] ??= DB::table('indonesia_villages')->where('district_code', $district->code)->orderBy('code')->get()->all();
        $village = $this->pick('p-village', $key, $this->villages[$district->code]);
        $cityName = DB::table('indonesia_cities')->where('code', $city)->value('name');

        return [
            'known' => true,
            'city' => $city,
            'city_name' => ucwords(strtolower((string) $cityName)),
            'district' => $district->code,
            'district_name' => ucwords(strtolower($district->name)),
            'village' => $village->code,
            'village_name' => ucwords(strtolower($village->name)),
            'rt' => str_pad((string) (1 + $this->roll('p-rt', $key, 9)), 3, '0', STR_PAD_LEFT),
            'rw' => str_pad((string) (1 + $this->roll('p-rw', $key, 6)), 3, '0', STR_PAD_LEFT),
        ];
    }

    private function histories(Applicant $applicant, ApplicantStatus $status, User $admin, CarbonInterface $at): void
    {
        $chain = match ($status) {
            ApplicantStatus::Registered => [[null, ApplicantStatus::Registered, null]],
            ApplicantStatus::Verified => [[null, ApplicantStatus::Registered, null], [ApplicantStatus::Registered, ApplicantStatus::Verified, null]],
            ApplicantStatus::Accepted => [[null, ApplicantStatus::Registered, null], [ApplicantStatus::Registered, ApplicantStatus::Verified, null], [ApplicantStatus::Verified, ApplicantStatus::Accepted, null]],
            ApplicantStatus::Rejected => [[null, ApplicantStatus::Registered, null], [ApplicantStatus::Registered, ApplicantStatus::Rejected, $applicant->decision_reason]],
            ApplicantStatus::Cancelled => [[null, ApplicantStatus::Registered, null], [ApplicantStatus::Registered, ApplicantStatus::Cancelled, $applicant->decision_reason]],
        };
        foreach ($chain as $step => [$from, $to, $reason]) {
            $when = $at->copy()->addDays($step * 5)->addMinutes($step);
            ApplicantStatusHistory::unguarded(fn () => $applicant->statusHistories()->create([
                'from_status' => $from,
                'to_status' => $to,
                'reason' => $reason,
                'changed_by' => $from === null ? null : $admin->id,
                'created_at' => $when,
                'updated_at' => $when,
            ]));
        }
    }

    private function documents(Applicant $applicant, ApplicantStatus $status, User $admin, CarbonInterface $at): void
    {
        $verified = in_array($status, [ApplicantStatus::Verified, ApplicantStatus::Accepted], true);
        $types = match (true) {
            $verified => DocumentType::cases(),
            $status === ApplicantStatus::Registered && $applicant->source === ApplicantSource::Offline => [],
            $status === ApplicantStatus::Registered => array_slice(DocumentType::cases(), 0, 1 + $applicant->id % 3),
            default => array_slice(DocumentType::cases(), 0, 2),
        };
        foreach ($types as $type) {
            $isPhoto = $type === DocumentType::PasFoto;
            $extension = $isPhoto ? 'png' : 'pdf';
            $path = 'psb/demo/'.$applicant->id.'/'.$type->value.'.'.$extension;
            $content = $isPhoto ? (string) base64_decode(self::PNG) : self::PDF;
            Storage::disk('local')->put($path, $content);
            ApplicantDocument::unguarded(fn () => ApplicantDocument::updateOrCreate(
                ['applicant_id' => $applicant->id, 'type' => $type],
                [
                    'path' => $path,
                    'original_name' => str_replace('_', '-', $type->value).'-'.strtolower(explode(' ', $applicant->full_name)[1] ?? 'santri').'.'.$extension,
                    'size' => strlen($content),
                    'mime' => $isPhoto ? 'image/png' : 'application/pdf',
                    'is_verified' => $verified,
                    'verified_at' => $verified ? $at->copy()->addDays(6) : null,
                    'verified_by' => $verified ? $admin->id : null,
                    'created_at' => $at->copy()->addMinutes(10),
                    'updated_at' => $at->copy()->addMinutes(10),
                ],
            ));
        }
    }

    private function payments(Applicant $applicant, ApplicantStatus $status, User $admin, CarbonInterface $at): void
    {
        $plan = match ($status) {
            ApplicantStatus::Accepted => [[300000, 'Uang pendaftaran'], [1200000, 'Daftar ulang dan seragam']],
            ApplicantStatus::Verified => $applicant->id % 3 === 0 ? [] : [[300000, 'Uang pendaftaran']],
            default => [],
        };
        foreach ($plan as $step => [$amount, $note]) {
            $paidAt = $at->copy()->addDays(7 + $step * 7)->setTime(10, 15);
            ApplicantPayment::unguarded(fn () => ApplicantPayment::updateOrCreate(
                ['applicant_id' => $applicant->id, 'note' => $note],
                ['amount' => $amount, 'paid_at' => $paidAt, 'recorded_by' => $admin->id, 'created_at' => $paidAt, 'updated_at' => $paidAt],
            ));
        }
    }
}
