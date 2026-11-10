<?php

namespace Tests\Feature;

use App\Models\AlumniImportBatch;
use App\Models\AlumniProfile;
use App\Models\Santri;
use App\Models\User;
use App\Services\AlumniImport;
use App\Services\AlumniPrivacy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;
use ZipArchive;

class AdminAlumniTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_verification_requires_rejection_reason_and_records_decision(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = AlumniProfile::factory()->create();
        $this->actingAs($admin)->patch(route('admin.alumni.verify', $profile), ['status' => 'rejected'])->assertSessionHasErrors('rejection_reason');
        $this->patch(route('admin.alumni.verify', $profile), ['status' => 'rejected', 'rejection_reason' => 'Tahun masuk perlu diperiksa'])->assertSessionHasNoErrors();
        $this->assertSame('rejected', $profile->fresh()->verification_status->value);
        $this->assertSame('Tahun masuk perlu diperiksa', $profile->fresh()->rejection_reason);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id, 'action' => 'profile.rejected']);
        $santri = Santri::factory()->create();
        $this->patch(route('admin.alumni.verify', $profile), ['status' => 'approved', 'santri_id' => $santri->id])->assertSessionHasNoErrors();
        $profile->update(['phone_whatsapp' => '628123456789']);
        $this->get(route('admin.alumni.edit', $profile))->assertOk();
        $this->assertDatabaseHas('audit_logs', ['action' => 'contact.viewed', 'subject_type' => 'alumni_profile', 'subject_id' => $profile->id, 'actor_id' => $admin->id]);
        $this->assertSame('approved', $profile->fresh()->verification_status->value);
        $this->assertSame($santri->id, $profile->fresh()->santri_id);
        $this->assertNull($profile->fresh()->rejection_reason);
    }

    public function test_admin_manual_input_ignores_privacy_and_user_assignment_and_links_santri_only_explicitly(): void
    {
        $profile = AlumniProfile::factory()->make();
        $data = array_intersect_key($profile->toArray(), array_flip(AlumniPrivacy::EDITABLE));
        $this->actingAs(User::factory()->admin()->create())->post(route('admin.alumni.store'), [...$data, 'map_mode' => 'visible', 'directory_visible' => true, 'user_id' => 1])->assertSessionHasNoErrors();
        $saved = AlumniProfile::firstOrFail();
        $this->assertSame('admin', $saved->source);
        $this->assertNull($saved->user_id);
        $this->assertNull($saved->map_mode);
        $this->assertNull($saved->directory_visible);
        $this->assertNull($saved->santri_id);
    }

    public function test_admin_list_has_server_side_filters_sort_and_pagination(): void
    {
        AlumniProfile::factory()->count(21)->create(['angkatan' => '2005']);
        AlumniProfile::factory()->create(['angkatan' => '2006']);
        $this->actingAs(User::factory()->admin()->create())->get(route('admin.alumni.index', ['angkatan' => '2005', 'per_page' => 10, 'sort' => 'full_name', 'direction' => 'asc']))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 10)->where('profiles.total', 21)->missing('profiles.data.0.claim_code_hash')->missing('profiles.data.0.photo_path')->missing('profiles.data.0.phone_whatsapp')->missing('profiles.data.0.bio'));
        $this->get(route('admin.alumni.index', ['sort' => 'email;DROP TABLE users']))->assertSessionHasErrors('sort');
    }

    public function test_csv_preview_marks_invalid_and_duplicate_rows_then_confirmation_is_single_use(): void
    {
        AlumniProfile::factory()->make();
        $admin = User::factory()->admin()->create();
        $csv = implode(',', AlumniImport::HEADERS)."\n";
        $csv .= "Alya Alumni,female,2010,2016,putri,lulus,2010,35,3571,bekerja,Guru,,,\n";
        $csv .= "Alya Alumni,female,2010,2016,putri,lulus,2010,35,3571,bekerja,Guru,,,\n";
        $csv .= "Baris Salah,male,2039,,putra,lulus,2039,XX,XXXX,bekerja,,,,\n";
        $response = $this->actingAs($admin)->post(route('admin.alumni.import.preview'), ['file' => UploadedFile::fake()->createWithContent('alumni.csv', $csv)])->assertSessionHasNoErrors()->assertOk();
        $preview = $response->viewData('page')['props']['preview'];
        $this->assertCount(3, $preview['rows']);
        $this->assertEmpty($preview['rows'][0]['errors']);
        $this->assertNotEmpty($preview['rows'][1]['errors']);
        $this->assertNotEmpty($preview['rows'][2]['errors']);
        $this->post(route('admin.alumni.import.store'), ['token' => $preview['token']])->assertSessionHasNoErrors();
        $batch = AlumniImportBatch::firstOrFail();
        $this->assertSame(1, $batch->created_count);
        $this->assertSame(2, $batch->failed_count);
        $saved = AlumniProfile::firstOrFail();
        $this->assertNull($saved->user_id);
        $this->assertNull($saved->map_mode);
        $this->assertNull($saved->directory_visible);
        $this->assertSame('import', $saved->source);
        $this->assertDatabaseHas('audit_logs', ['action' => 'alumni.imported']);
        $this->post(route('admin.alumni.import.store'), ['token' => $preview['token']])->assertSessionHasErrors('token');
    }

    public function test_import_preview_cannot_be_confirmed_by_another_admin(): void
    {
        AlumniProfile::factory()->make();
        $admin = User::factory()->admin()->create();
        $preview = app(AlumniImport::class)->preview(UploadedFile::fake()->createWithContent('alumni.csv', implode(',', AlumniImport::HEADERS)."\nAlya Alumni,female,2010,2016,putri,lulus,2010,35,3571,bekerja,Guru,,,\n"), $admin);
        $this->actingAs(User::factory()->admin()->create())->post(route('admin.alumni.import.store'), ['token' => $preview['token']])->assertSessionHasErrors('token');
        $this->assertDatabaseEmpty('alumni_profiles');
    }

    public function test_excel_import_reads_values_and_rejects_formula(): void
    {
        AlumniProfile::factory()->make();
        $admin = User::factory()->admin()->create();
        $file = new UploadedFile(tempnam(sys_get_temp_dir(), 'alumni-xlsx'), 'alumni.xlsx', test: true);
        $this->beforeApplicationDestroyed(fn () => unlink($file->getPathname()));
        $zip = new ZipArchive;
        $zip->open($file->getPathname(), ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $rows = [AlumniImport::HEADERS, ['Alumni Excel', 'male', '2010', '2016', 'putra', 'lulus', '2010', '35', '3571', 'bekerja', '', '', '', '']];
        $xml = '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
        foreach ($rows as $i => $row) {
            $xml .= '<row>';
            foreach ($row as $j => $value) {
                $xml .= '<c r="'.chr(65 + $j).($i + 1).'" t="inlineStr"><is><t>'.htmlspecialchars($value).'</t></is></c>';
            } $xml .= '</row>';
        }
        $zip->addFromString('xl/worksheets/sheet1.xml', $xml.'</sheetData></worksheet>');
        $zip->close();
        $preview = app(AlumniImport::class)->preview($file, $admin);
        $this->assertEmpty($preview['rows'][0]['errors']);
        $zip->open($file->getPathname());
        $zip->addFromString('xl/worksheets/sheet1.xml', '<worksheet><sheetData><row><c r="A1"><f>1+1</f><v>2</v></c></row></sheetData></worksheet>');
        $zip->close();
        $this->expectException(ValidationException::class);
        app(AlumniImport::class)->preview($file, $admin);
    }

    public function test_template_export_audit_and_claim_code_hash(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = AlumniProfile::factory()->create(['source' => 'import', 'user_id' => null]);
        $this->actingAs($admin)->get(route('admin.alumni.import.template'))->assertDownload('template-alumni.csv');
        $response = $this->get(route('admin.alumni.export'))->assertDownload('alumni.csv');
        $this->assertStringContainsString($profile->full_name, $response->streamedContent());
        $this->assertDatabaseHas('audit_logs', ['action' => 'alumni.exported']);
        $response = $this->postJson(route('admin.alumni.claims.store', $profile))->assertOk();
        $code = $response->json('code');
        $this->assertSame(hash('sha256', $code), $profile->fresh()->claim_code_hash);
        $this->assertNotSame($code, $profile->fresh()->claim_code_hash);
    }
}
