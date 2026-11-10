<?php

namespace Tests\Feature;

use App\Models\RegistrationPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RegistrationPeriodTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return ['name' => 'PSB Gelombang Pertama', 'academic_year' => '2027/2028', 'is_open' => false, 'opens_at' => '2027-01-01T01:00:00Z', 'closes_at' => null];
    }

    public function test_period_create_and_edit_are_admin_pages(): void
    {
        $period = RegistrationPeriod::factory()->create();
        $this->get(route('admin.psb.periods.create'))->assertRedirect(route('login'));
        $this->actingAs(User::factory()->create());
        $this->get(route('admin.psb.periods.create'))->assertForbidden();
        $this->get(route('admin.psb.periods.edit', $period))->assertForbidden();
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']));
        $this->get(route('admin.psb.periods.create'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/psb/periods/create'));
        $this->get(route('admin.psb.periods.edit', $period))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/psb/periods/edit')->where('period.id', $period->id));
    }

    public function test_form_saves_formatted_information_and_images_and_removes_unsafe_html(): void
    {
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']));
        $html = '<h2>Persyaratan</h2><ul><li><strong>Kartu keluarga</strong></li></ul><img src="https://example.test/poster.png" alt="Poster" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">Tautan</a>';
        $this->post(route('admin.psb.periods.store'), [...$this->payload(), 'info_note' => $html])->assertSessionHasNoErrors()->assertRedirect(route('admin.psb.periods.index'));
        $period = RegistrationPeriod::firstOrFail();
        $saved = (string) $period->info_note;
        $this->assertStringContainsString('<h2>Persyaratan</h2>', $saved);
        $this->assertStringContainsString('<strong>Kartu keluarga</strong>', $saved);
        $this->assertStringContainsString('https://example.test/poster.png', $saved);
        $this->assertStringNotContainsString('<script', $saved);
        $this->assertStringNotContainsString('onerror', $saved);
        $this->assertStringNotContainsString('javascript:', $saved);
        $this->get(route('psb.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('infoHtml', $saved));
        $this->put(route('admin.psb.periods.update', $period), [...$this->payload(), 'info_note' => '<h3>Fasilitas</h3><p>Asrama dan pembelajaran.</p><iframe src="https://example.test"></iframe>'])->assertSessionHasNoErrors()->assertRedirect(route('admin.psb.periods.index'));
        $this->assertDatabaseCount('registration_periods', 1);
        $this->assertStringContainsString('<h3>Fasilitas</h3>', (string) $period->fresh()->info_note);
        $this->assertStringNotContainsString('<iframe', (string) $period->fresh()->info_note);
    }

    public function test_old_plain_text_information_still_appears_without_becoming_html(): void
    {
        RegistrationPeriod::factory()->create(['info_note' => "Syarat pendaftaran\nBawa kartu keluarga."]);
        $this->get(route('psb.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('infoHtml', null)->where('period.info_note', "Syarat pendaftaran\nBawa kartu keluarga."));
    }

    public function test_period_images_are_uploaded_to_public_storage_only_by_admins(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->author()->create())->postJson(route('admin.psb.periods.images.store'), ['image' => UploadedFile::fake()->image('poster.png')])->assertForbidden();
        Storage::disk('public')->assertEmpty();
        $response = $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))->postJson(route('admin.psb.periods.images.store'), ['image' => UploadedFile::fake()->image('poster.png')])->assertCreated();
        $this->assertStringContainsString('/storage/psb/periods/content/', $response->json('url'));
        $files = Storage::disk('public')->allFiles('psb/periods/content');
        $this->assertCount(1, $files);
        Storage::disk('public')->assertExists($files);
    }

    /** @return array<string, array{string}> */
    public static function invalidImages(): array
    {
        return ['oversized' => ['large'], 'svg' => ['svg'], 'pdf' => ['pdf']];
    }

    #[DataProvider('invalidImages')]
    public function test_invalid_period_images_return_422_and_are_not_stored(string $kind): void
    {
        Storage::fake('public');
        $file = match ($kind) {
            'large' => UploadedFile::fake()->image('large.jpg')->size(2049),
            'svg' => UploadedFile::fake()->createWithContent('poster.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
            'pdf' => UploadedFile::fake()->create('poster.pdf', 1, 'application/pdf'),
        };
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))->postJson(route('admin.psb.periods.images.store'), ['image' => $file])->assertUnprocessable()->assertJsonValidationErrors('image');
        Storage::disk('public')->assertEmpty();
    }
}
