<?php

namespace Tests\Feature;

use App\EventStatus;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminEventTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create(['email' => 'admin@example.test']);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'title' => 'Kajian Bersama', 'description' => '<p>Belajar bersama pesantren.</p>',
            'start_at' => '2027-01-10T09:00', 'end_at' => '2027-01-10T11:00',
            'timezone' => 'Asia/Jakarta', 'type' => 'offline', 'status' => 'draft',
            'location_name' => 'Aula', 'address' => 'Kompleks pesantren', 'category_ids' => [],
        ];
    }

    public function test_guests_and_non_admins_cannot_access_admin_routes(): void
    {
        $event = Event::factory()->create();
        $this->get(route('admin.events.index'))->assertRedirect(route('login'));
        $this->post(route('admin.events.store'), $this->payload())->assertRedirect(route('login'));
        $this->actingAs(User::factory()->create());
        $this->get(route('admin.events.index'))->assertForbidden();
        $this->get(route('admin.events.create'))->assertForbidden();
        $this->get(route('admin.events.edit', $event))->assertForbidden();
        $this->post(route('admin.events.store'), $this->payload())->assertForbidden();
        $this->put(route('admin.events.update', $event), $this->payload())->assertForbidden();
        $this->delete(route('admin.events.destroy', $event))->assertForbidden();
        $this->patch(route('admin.events.status.update', $event), ['status' => 'published'])->assertForbidden();
        $this->post(route('admin.events.duplicate', $event))->assertForbidden();
        $this->assertSame(1, Event::count());
    }

    public function test_unverified_admin_is_redirected_and_article_editors_are_not_event_admins(): void
    {
        $this->actingAs(User::factory()->admin()->unverified()->create(['email' => 'admin@example.test']))->get(route('admin.events.index'))->assertRedirect(route('verification.notice'));
        $editor = User::factory()->editor()->create();
        $this->actingAs($editor)->get(route('admin.events.index'))->assertForbidden();
    }

    public function test_admin_crud_normalizes_whatsapp_and_stores_local_dates_in_utc(): void
    {
        $admin = $this->admin();
        $category = Category::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($admin)->post(route('admin.events.store'), [...$this->payload(), 'category_ids' => [$category->id], 'contact_whatsapp' => '+62 812-3456-7890', 'organizer_id' => $other->id])->assertRedirect(route('admin.events.index'));
        $event = Event::firstOrFail();
        $this->assertSame('kajian-bersama', $event->slug);
        $this->assertSame('6281234567890', $event->contact_whatsapp);
        $this->assertSame($admin->id, $event->organizer_id);
        $this->assertSame('2027-01-10 02:00:00', $event->start_at->format('Y-m-d H:i:s'));
        $this->assertSame([$category->id], $event->categories()->pluck('categories.id')->all());
        $this->put(route('admin.events.update', $event), [...$this->payload(), 'title' => 'Judul Baru', 'contact_whatsapp' => '081234567890'])->assertRedirect();
        $this->assertSame('kajian-bersama', $event->fresh()->slug);
        $this->assertSame('6281234567890', $event->fresh()->contact_whatsapp);
        $this->assertSame(0, $event->categories()->count());
        $this->delete(route('admin.events.destroy', $event))->assertRedirect();
        $this->assertSoftDeleted($event);
    }

    /** @return array<string, array{array<string, mixed>, list<string>}> */
    public static function invalidPayloads(): array
    {
        return [
            'end before start' => [['end_at' => '2027-01-10T08:00'], ['end_at']],
            'same time' => [['end_at' => '2027-01-10T09:00'], ['end_at']],
            'online requires meeting' => [['type' => 'online'], ['meeting_url']],
            'hybrid requires meeting and venue' => [['type' => 'hybrid', 'location_name' => '', 'address' => ''], ['meeting_url', 'location_name', 'address']],
            'offline requires venue' => [['location_name' => '', 'address' => ''], ['location_name', 'address']],
            'unsafe URLs' => [['registration_url' => 'javascript:alert(1)', 'map_url' => 'invalid', 'meeting_url' => 'ftp://example.test'], ['registration_url', 'map_url', 'meeting_url']],
            'foreign mobile' => [['contact_whatsapp' => '+14155552671'], ['contact_whatsapp']],
            'alphabetic mobile' => [['contact_whatsapp' => '0812abc34567890'], ['contact_whatsapp']],
            'invalid timezone' => [['timezone' => 'Invalid/Zone'], ['timezone']],
            'invalid enums' => [['type' => 'unknown', 'status' => 'unknown'], ['type', 'status']],
            'seo lengths' => [['meta_title' => str_repeat('a', 71), 'meta_description' => str_repeat('a', 161)], ['meta_title', 'meta_description']],
        ];
    }

    #[DataProvider('invalidPayloads')]
    public function test_invalid_event_data_is_rejected(array $changes, array $errors): void
    {
        $this->actingAs($this->admin())->post(route('admin.events.store'), [...$this->payload(), ...$changes])->assertSessionHasErrors($errors);
        $this->assertDatabaseCount('events', 0);
    }

    public function test_non_image_and_oversized_banners_are_rejected(): void
    {
        $this->actingAs($this->admin());
        $this->post(route('admin.events.store'), [...$this->payload(), 'banner' => UploadedFile::fake()->create('payload.txt', 1, 'text/plain')])->assertSessionHasErrors('banner');
        $this->post(route('admin.events.store'), [...$this->payload(), 'banner' => UploadedFile::fake()->image('large.jpg')->size(2049)])->assertSessionHasErrors('banner');
        $this->assertDatabaseCount('events', 0);
    }

    public function test_description_sanitization_and_empty_html_rejection_clean_up_uploads(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin());
        $this->post(route('admin.events.store'), [...$this->payload(), 'description' => '<script>evil()</script><p onerror="evil()">Aman</p><img src="https://example.test/image.jpg" onerror="evil()">'])->assertRedirect();
        $html = Event::firstOrFail()->description;
        $this->assertStringNotContainsString('<script', $html);
        $this->assertStringNotContainsString('onerror', $html);
        $this->assertStringContainsString('<p>Aman</p>', $html);
        $this->post(route('admin.events.store'), [...$this->payload(), 'description' => '<script>evil()</script><p></p>', 'banner' => UploadedFile::fake()->image('banner.png')])->assertSessionHasErrors(['description' => 'Deskripsi event wajib diisi.']);
        $this->assertDatabaseCount('events', 1);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_banner_replacement_removal_and_soft_deletion_preserve_expected_files(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin())->post(route('admin.events.store'), [...$this->payload(), 'banner' => UploadedFile::fake()->image('banner.jpg')])->assertRedirect();
        $event = Event::firstOrFail();
        $first = $event->banner;
        Storage::disk('public')->assertExists($first);
        $this->post(route('admin.events.update', $event), [...$this->payload(), '_method' => 'put', 'banner' => UploadedFile::fake()->image('new.webp')])->assertRedirect();
        Storage::disk('public')->assertMissing($first);
        $second = $event->fresh()->banner;
        $this->put(route('admin.events.update', $event), [...$this->payload(), 'remove_banner' => true])->assertRedirect();
        Storage::disk('public')->assertMissing($second);
        $this->assertNull($event->fresh()->banner);
    }

    public function test_duplicate_has_unique_slug_draft_future_dates_independent_banner_and_categories(): void
    {
        $this->freezeTime();
        Storage::fake('public');
        $banner = UploadedFile::fake()->image('banner.jpg')->store('events', 'public');
        $category = Category::factory()->create();
        $original = Event::factory()->published()->past()->hasAttached($category)->create(['banner' => $banner]);
        $admin = $this->admin();
        $this->actingAs($admin)->post(route('admin.events.duplicate', $original))->assertRedirect();
        $copy = Event::whereKeyNot($original->id)->firstOrFail();
        $this->assertSame(EventStatus::Draft, $copy->status);
        $this->assertSame($original->title.' (Salinan)', $copy->title);
        $this->assertNotSame($original->slug, $copy->slug);
        $this->assertNotSame($banner, $copy->banner);
        $this->assertSame($admin->id, $copy->organizer_id);
        $this->assertTrue($copy->start_at->isFuture());
        $this->assertSame(7200.0, $copy->start_at->diffInSeconds($copy->end_at));
        $this->assertSame([$category->id], $copy->categories()->pluck('categories.id')->all());
        $this->assertSame(Storage::disk('public')->get($banner), Storage::disk('public')->get($copy->banner));
        $copy->forceDelete();
        Storage::disk('public')->assertExists($banner);
    }

    public function test_admin_can_publish_unpublish_and_cancel_and_invalid_status_is_rejected(): void
    {
        $event = Event::factory()->create();
        $this->actingAs($this->admin());
        foreach (EventStatus::cases() as $status) {
            $this->patch(route('admin.events.status.update', $event), ['status' => $status->value])->assertRedirect();
            $this->assertSame($status, $event->fresh()->status);
        }
        $this->patch(route('admin.events.status.update', $event), ['status' => 'invalid'])->assertSessionHasErrors('status');
        $this->assertSame(EventStatus::Cancelled, $event->fresh()->status);
    }

    public function test_admin_index_filters_date_type_status_search_and_paginates(): void
    {
        $admin = $this->admin();
        for ($number = 1; $number <= 6; $number++) {
            Event::factory()->for($admin, 'organizer')->published()->online()->create(['title' => 'Kajian '.$number, 'start_at' => '2027-01-10 02:00:00', 'end_at' => '2027-01-10 04:00:00']);
        }
        Event::factory()->published()->create(['title' => 'Kajian di luar tanggal']);
        $this->actingAs($admin)->get(route('admin.events.index', [
            'search' => 'Kajian', 'status' => 'published', 'type' => 'online', 'date_from' => '2027-01-10', 'date_to' => '2027-01-10', 'sort' => 'title', 'direction' => 'asc', 'per_page' => 5, 'page' => 2,
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/events/index', false)->where('events.total', 6)->has('events.data', 1)->where('events.data.0.title', 'Kajian 6'));
    }

    public function test_slug_conflicts_are_rejected_and_automatic_slugs_are_unique(): void
    {
        $this->actingAs($this->admin());
        $this->post(route('admin.events.store'), $this->payload())->assertRedirect();
        $this->post(route('admin.events.store'), $this->payload())->assertRedirect();
        $this->assertDatabaseHas('events', ['slug' => 'kajian-bersama-2']);
        $this->post(route('admin.events.store'), [...$this->payload(), 'slug' => 'kajian-bersama'])->assertSessionHasErrors('slug');
    }

    public function test_admin_pages_supply_shared_form_data_and_dates_in_wib(): void
    {
        $event = Event::factory()->create(['start_at' => '2027-01-10 02:00:00', 'end_at' => '2027-01-10 04:00:00', 'timezone' => 'Asia/Makassar']);
        $this->actingAs($this->admin());
        $this->get(route('admin.events.create'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/events/create')->has('statuses', 3)->has('types', 3)->has('categories')->where('eventAccess.canManage', true));
        $this->get(route('admin.events.edit', $event))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/events/edit')->where('event.id', $event->id)->where('startLocal', '2027-01-10T09:00')->where('endLocal', '2027-01-10T11:00'));
    }

    public function test_editing_an_event_in_wib_preserves_its_absolute_schedule(): void
    {
        $event = Event::factory()->create(['start_at' => '2027-01-10 02:00:00', 'end_at' => '2027-01-10 04:00:00', 'timezone' => 'Asia/Makassar']);

        $this->actingAs($this->admin())->put(route('admin.events.update', $event), $this->payload())->assertRedirect(route('admin.events.index'));

        $event->refresh();
        $this->assertSame('Asia/Jakarta', $event->timezone);
        $this->assertSame('2027-01-10 02:00:00', $event->start_at->format('Y-m-d H:i:s'));
        $this->assertSame('2027-01-10 04:00:00', $event->end_at->format('Y-m-d H:i:s'));
    }
}
