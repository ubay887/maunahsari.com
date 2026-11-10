<?php

namespace Tests\Feature;

use App\Models\SitePage;
use App\Models\User;
use App\Services\SiteDefaults;
use App\SitePageKey;
use Database\Seeders\SitePageSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSitePagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_and_non_admins_cannot_manage_site_pages(): void
    {
        $this->get(route('admin.site.index'))->assertRedirect(route('login'));
        $this->put(route('admin.site.update', 'contact'), [])->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create());
        $this->get(route('admin.site.index'))->assertForbidden();
        $this->get(route('admin.site.edit', 'contact'))->assertForbidden();
        $this->put(route('admin.site.update', 'contact'), SiteDefaults::for(SitePageKey::Contact))->assertForbidden();
        $this->assertDatabaseCount('site_pages', 0);
    }

    public function test_admin_sees_all_pages_and_edits_with_defaults_when_never_saved(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->get(route('admin.site.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/site/index')
            ->has('pages', 4)
            ->where('pages.0.key', 'profile')
            ->where('pages.0.updated_at', null));

        $this->get(route('admin.site.edit', 'pondok-putri'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/site/edit')
            ->where('page.key', 'pondok-putri')
            ->where('content.programs.0.title', 'Bil-Hifdhi'));

        $this->get('/admin/site/tidak-ada/edit')->assertNotFound();
    }

    public function test_saving_a_pondok_page_replaces_content_and_shows_on_the_public_page(): void
    {
        $admin = User::factory()->admin()->create();
        $content = [...SiteDefaults::for(SitePageKey::PondokPutra), 'quota_note' => 'Kuota diperbarui.', 'programs' => [['title' => 'Program Baru', 'description' => 'Deskripsi.', 'target' => 'Target.']]];

        $this->actingAs($admin)->put(route('admin.site.update', 'pondok-putra'), $content)->assertRedirect(route('admin.site.index'));

        $saved = SitePage::where('key', 'pondok-putra')->firstOrFail();
        $this->assertSame($admin->id, $saved->updated_by);
        $this->assertCount(1, $saved->content['programs']);

        $this->get(route('site.pondok.putra'))->assertInertia(fn (Assert $page) => $page
            ->where('content.quota_note', 'Kuota diperbarui.')
            ->where('content.programs.0.title', 'Program Baru'));
        $this->get(route('site.pondok.putri'))->assertInertia(fn (Assert $page) => $page
            ->where('content.programs.0.title', 'Bil-Hifdhi'));
    }

    public function test_profile_html_is_sanitized_and_cannot_be_empty(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $profile = SiteDefaults::for(SitePageKey::Profile);

        $this->put(route('admin.site.update', 'profile'), [...$profile, 'history_html' => '<p>Sejarah</p><script>alert(1)</script><img src="x" onerror="alert(1)">'])->assertRedirect();
        $html = SitePage::where('key', 'profile')->firstOrFail()->content['history_html'];
        $this->assertStringNotContainsString('script', $html);
        $this->assertStringNotContainsString('onerror', $html);
        $this->assertStringContainsString('<p>Sejarah</p>', $html);

        $this->put(route('admin.site.update', 'profile'), [...$profile, 'history_html' => '<script>alert(1)</script>'])->assertSessionHasErrors('history_html');
    }

    public function test_contact_validation_rejects_bad_phone_and_unsafe_links(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $contact = SiteDefaults::for(SitePageKey::Contact);

        $this->put(route('admin.site.update', 'contact'), [...$contact, 'contacts' => [['role' => 'Kantor', 'phone' => 'abc', 'description' => 'x']]])
            ->assertSessionHasErrors('contacts.0.phone');
        $this->put(route('admin.site.update', 'contact'), [...$contact, 'social' => [['name' => 'X', 'handle' => '@x', 'href' => 'javascript:alert(1)']]])
            ->assertSessionHasErrors('social.0.href');
        $this->put(route('admin.site.update', 'contact'), [...$contact, 'contacts' => []])
            ->assertSessionHasErrors('contacts');
        $this->assertDatabaseCount('site_pages', 0);
    }

    public function test_saved_contact_feeds_the_narahubung_footer_data_with_whatsapp_links(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $contact = [...SiteDefaults::for(SitePageKey::Contact), 'address' => 'Alamat baru 1', 'contacts' => [['role' => 'Kantor Utama', 'phone' => '0811-2222-3333', 'description' => 'Info umum.']]];

        $this->put(route('admin.site.update', 'contact'), $contact)->assertRedirect();

        $this->get(route('site.contact'))->assertInertia(fn (Assert $page) => $page
            ->where('siteInfo.address', 'Alamat baru 1')
            ->where('siteInfo.contacts.0.href', 'https://wa.me/6281122223333'));
    }

    public function test_seeder_is_idempotent_and_keeps_edited_pages(): void
    {
        $this->seed(SitePageSeeder::class);
        SitePage::where('key', 'contact')->update(['content' => [...SiteDefaults::for(SitePageKey::Contact), 'address' => 'Diedit admin']]);
        $this->seed(SitePageSeeder::class);

        $this->assertDatabaseCount('site_pages', 4);
        $this->assertSame('Diedit admin', SitePage::where('key', 'contact')->firstOrFail()->content['address']);
    }
}
