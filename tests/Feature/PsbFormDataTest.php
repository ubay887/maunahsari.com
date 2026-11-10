<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\ProgramQuota;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PsbFormDataTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function payload(ProgramQuota $quota): array
    {
        return [...Applicant::factory()->withRegionalAddress()->make(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id])->toArray(), 'birth_date' => '2013-02-10', 'email' => 'calon.santri@example.test', 'password' => 'password-calon-santri', 'password_confirmation' => 'password-calon-santri'];
    }

    public function test_admin_and_public_forms_offer_the_same_controlled_choices(): void
    {
        $quota = ProgramQuota::factory()->create();
        $this->payload($quota);
        $assertChoices = fn (Assert $page) => $page
            ->where('guardianRelations.0.value', 'Ayah')
            ->where('educationLevels', fn ($levels): bool => collect($levels)->contains('value', 'SD/MI'))
            ->where('addressOptions.provinces.0.value', '35');
        $this->get(route('psb.register'))->assertOk()->assertInertia($assertChoices);
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))
            ->get(route('admin.psb.applicants.create'))->assertOk()->assertInertia($assertChoices);
    }

    public function test_online_registration_preserves_all_nik_digits_and_saves_structured_address_without_school(): void
    {
        Storage::fake('local');
        $quota = ProgramQuota::factory()->create();
        $data = [...$this->payload($quota), 'nik' => '0123456789012345', 'documents' => [
            'ijazah' => UploadedFile::fake()->create('ijazah.pdf', 1, 'application/pdf'),
            'kartu_keluarga' => UploadedFile::fake()->create('kk.pdf', 1, 'application/pdf'),
            'pas_foto' => UploadedFile::fake()->image('foto.jpg'),
        ]];
        $this->post(route('psb.store'), $data)->assertSessionHasNoErrors()->assertRedirect(route('psb.success'));
        $this->assertDatabaseHas('applicants', ['nik' => '0123456789012345', 'province_code' => '35', 'city_code' => '3571', 'district_code' => '357101', 'village_code' => '3571011001', 'rt' => '001', 'rw' => '002', 'postal_code' => '64114', 'last_education' => 'SD/MI', 'last_school' => null]);
        Storage::disk('local')->assertExists(Applicant::firstOrFail()->documents()->pluck('path')->all());
    }

    /** @return array<string, array{string, mixed, string}> */
    public static function invalidFields(): array
    {
        return [
            'nik missing' => ['nik', '', 'NIK wajib diisi.'],
            'nik short' => ['nik', '123456789012345', 'NIK harus terdiri dari tepat 16 digit angka.'],
            'nik long' => ['nik', '12345678901234567', 'NIK harus terdiri dari tepat 16 digit angka.'],
            'nik non digits' => ['nik', '123456789012345a', 'NIK harus terdiri dari tepat 16 digit angka.'],
            'education unknown' => ['last_education', 'Sekolah bebas', 'Pilih pendidikan terakhir dari daftar yang tersedia.'],
            'guardian unknown' => ['guardian_relation', 'Teman', 'Pilih hubungan wali dari daftar yang tersedia.'],
            'province unknown' => ['province_code', '99', 'Provinsi tidak valid.'],
            'rt too long' => ['rt', '1234', 'RT harus terdiri dari 1 sampai 3 digit angka.'],
            'rw non digits' => ['rw', 'RW1', 'RW harus terdiri dari 1 sampai 3 digit angka.'],
            'postal code short' => ['postal_code', '1234', 'Kode pos harus terdiri dari 5 digit angka.'],
        ];
    }

    #[DataProvider('invalidFields')]
    public function test_invalid_identity_and_master_values_do_not_create_a_registration(string $field, mixed $value, string $message): void
    {
        $quota = ProgramQuota::factory()->create();
        $data = [...$this->payload($quota), $field => $value];
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))
            ->post(route('admin.psb.applicants.store'), $data)->assertSessionHasErrors([$field => $message]);
        $this->assertDatabaseCount('applicants', 0);
    }

    /** @return array<string, array{string, string, string}> */
    public static function mismatchedRegions(): array
    {
        return [
            'city outside province' => ['city_code', '1201', 'Kabupaten/kota harus berada di provinsi yang dipilih.'],
            'district outside city' => ['district_code', '120101', 'Kecamatan harus berada di kabupaten/kota yang dipilih.'],
            'village outside district' => ['village_code', '1201012001', 'Desa/kelurahan harus berada di kecamatan yang dipilih.'],
        ];
    }

    #[DataProvider('mismatchedRegions')]
    public function test_regions_from_a_different_parent_are_rejected(string $field, string $code, string $message): void
    {
        $quota = ProgramQuota::factory()->create();
        $data = $this->payload($quota);
        Province::create(['code' => '12', 'name' => 'SUMATERA UTARA']);
        City::create(['code' => '1201', 'province_code' => '12', 'name' => 'KABUPATEN NIAS']);
        District::create(['code' => '120101', 'city_code' => '1201', 'name' => 'CONTOH KECAMATAN']);
        Village::create(['code' => '1201012001', 'district_code' => '120101', 'name' => 'CONTOH DESA']);
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))
            ->post(route('admin.psb.applicants.store'), [...$data, $field => $code])->assertSessionHasErrors([$field => $message]);
        $this->assertDatabaseCount('applicants', 0);
    }

    public function test_region_endpoint_is_public_and_returns_only_children_of_the_selected_parent(): void
    {
        $quota = ProgramQuota::factory()->create();
        $this->payload($quota);
        City::create(['code' => '3501', 'province_code' => '35', 'name' => 'KABUPATEN PACITAN']);
        District::create(['code' => '350101', 'city_code' => '3501', 'name' => 'CONTOH KECAMATAN']);
        $this->getJson(route('psb.regions', ['level' => 'cities', 'parent_code' => '35']))->assertOk()->assertJsonCount(2, 'options');
        $this->getJson(route('psb.regions', ['level' => 'districts', 'parent_code' => '3571']))->assertOk()->assertExactJson(['options' => [['value' => '357101', 'label' => 'MOJOROTO']]]);
        $this->getJson(route('psb.regions', ['level' => 'villages', 'parent_code' => '357101']))->assertOk()->assertExactJson(['options' => [['value' => '3571011001', 'label' => 'BANDAR LOR']]]);
        $this->getJson(route('psb.regions', ['level' => 'cities', 'parent_code' => '99']))->assertOk()->assertExactJson(['options' => []]);
        $this->getJson(route('psb.regions', ['level' => 'unsafe', 'parent_code' => '35']))->assertUnprocessable()->assertJsonValidationErrors('level');
        $this->getJson(route('psb.regions', ['level' => 'cities', 'parent_code' => ['35']]))->assertUnprocessable()->assertJsonValidationErrors('parent_code');
    }

    public function test_edit_prefills_regional_choices_and_syncs_identity_and_address_to_existing_santri(): void
    {
        $quota = ProgramQuota::factory()->create();
        $applicant = Applicant::factory()->withRegionalAddress()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $santri = Santri::factory()->create(['applicant_id' => $applicant->id, 'program_id' => $applicant->program_id]);
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']));
        $this->get(route('admin.psb.applicants.edit', $applicant))->assertOk()->assertInertia(fn (Assert $page) => $page->where('addressOptions.cities.0.value', '3571')->where('addressOptions.districts.0.value', '357101')->where('addressOptions.villages.0.value', '3571011001'));
        $data = [...$applicant->toArray(), 'birth_date' => '2013-02-10', 'nik' => '3571011234567890', 'address' => 'Jalan contoh nomor 12', 'rt' => '003', 'last_school' => 'Isian yang sudah dihapus'];
        $this->put(route('admin.psb.applicants.update', $applicant), $data)->assertSessionHasNoErrors()->assertRedirect(route('admin.psb.applicants.show', $applicant));
        $this->assertDatabaseHas('santris', ['id' => $santri->id, 'nik' => '3571011234567890', 'village_code' => '3571011001', 'address' => 'Jalan contoh nomor 12', 'rt' => '003']);
        $this->assertDatabaseHas('applicants', ['id' => $applicant->id, 'last_school' => null]);
        $this->get(route('admin.santri.show', $santri))->assertOk()->assertInertia(fn (Assert $page) => $page->where('santri.nik', '3571011234567890')->where('santri.village.name', 'BANDAR LOR'));
    }
}
