<?php

namespace Tests\Feature;

use App\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Services\ArticleHtmlSanitizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminArticleTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return ['title' => 'Kabar Santri', 'content' => '<p>Berita pesantren</p>', 'status' => 'draft', 'category_ids' => [], 'tag_names' => []];
    }

    private function admin(): User
    {
        return User::factory()->admin()->create(['email' => 'admin@example.test']);
    }

    public function test_admin_index_filters_sorts_and_paginates_on_the_server(): void
    {
        $category = Category::factory()->create();
        $admin = $this->admin();
        for ($index = 1; $index <= 6; $index++) {
            Article::factory()->for($admin, 'author')->published()->hasAttached($category)->create(['title' => 'Kabar '.str_pad((string) $index, 2, '0', STR_PAD_LEFT)]);
        }
        Article::factory()->hasAttached($category)->create(['title' => 'Kabar draf']);
        Article::factory()->published()->create(['title' => 'Kabar tanpa kategori']);
        $this->actingAs($admin)->get(route('admin.articles.index', ['search' => 'Kabar', 'status' => 'published', 'category' => $category->id, 'sort' => 'title', 'direction' => 'asc', 'per_page' => 5, 'page' => 2]))
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/articles/index')->has('articles.data', 1)->where('articles.total', 6)->where('articles.current_page', 2)->where('articles.data.0.title', 'Kabar 06'));
        $this->get(route('admin.articles.index', ['sort' => 'title; DROP TABLE articles', 'direction' => 'invalid']))->assertOk()->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'created_at')->where('filters.direction', 'desc'));
    }

    public function test_author_index_does_not_expose_other_authors_articles(): void
    {
        $author = User::factory()->author()->create();
        $own = Article::factory()->for($author, 'author')->create();
        Article::factory()->create();
        $this->actingAs($author)->get(route('admin.articles.index'))->assertInertia(fn (Assert $page) => $page->has('articles.data', 1)->where('articles.data.0.id', $own->id)->where('canPublish', false));
    }

    public function test_admin_create_edit_and_taxonomy_pages_render_with_form_props(): void
    {
        $article = Article::factory()->create();
        $this->actingAs($this->admin());
        $this->get(route('admin.articles.create'))->assertInertia(fn (Assert $page) => $page->component('admin/articles/create')->has('statuses', 4)->where('canPublish', true));
        $this->get(route('admin.articles.edit', $article))->assertInertia(fn (Assert $page) => $page->component('admin/articles/edit')->where('article.id', $article->id)->has('article.categories')->has('article.tags'));
        $this->get(route('admin.taxonomies.index'))->assertInertia(fn (Assert $page) => $page->component('admin/articles/taxonomies')->has('categories')->has('tags'));
    }

    public function test_unverified_admin_cannot_enter_the_cms(): void
    {
        $admin = User::factory()->admin()->unverified()->create(['email' => 'admin@example.test']);
        $this->actingAs($admin)->get(route('admin.articles.index'))->assertRedirect(route('verification.notice'));
    }

    public function test_empty_sanitized_content_is_rejected_and_new_upload_is_cleaned_up(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin())->post(route('admin.articles.store'), [...$this->payload(), 'content' => '<script>alert(1)</script><p></p>', 'cover_image' => UploadedFile::fake()->image('cover.jpg')])->assertSessionHasErrors(['content' => 'Konten artikel wajib diisi.']);
        $this->assertDatabaseCount('articles', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_multipart_forms_can_omit_empty_taxonomy_arrays_and_clear_existing_selections(): void
    {
        $article = Article::factory()->hasAttached(Category::factory()->create())->create();
        $this->actingAs($this->admin())->post(route('admin.articles.update', $article), ['_method' => 'put', 'title' => 'Tanpa kategori', 'content' => '<p>Isi artikel</p>', 'status' => 'draft'])->assertRedirect();
        $this->assertSame(0, $article->categories()->count());
        $this->assertSame(0, $article->tags()->count());
    }

    public function test_automatic_slugs_are_unique_through_the_admin_endpoint_and_mass_assignment_is_limited(): void
    {
        $admin = $this->admin();
        $other = User::factory()->create();
        $this->actingAs($admin)->post(route('admin.articles.store'), $this->payload())->assertRedirect();
        $this->post(route('admin.articles.store'), [...$this->payload(), 'author_id' => $other->id, 'views_count' => 999])->assertRedirect();
        $article = Article::where('slug', 'kabar-santri-2')->firstOrFail();
        $this->assertSame($admin->id, $article->author_id);
        $this->assertSame(0, $article->views_count);
    }

    public function test_cover_can_be_removed_without_replacing_it(): void
    {
        Storage::fake('public');
        $path = UploadedFile::fake()->image('cover.png')->store('articles', 'public');
        $article = Article::factory()->create(['cover_image' => $path]);
        $this->actingAs($this->admin())->put(route('admin.articles.update', $article), [...$this->payload(), 'remove_cover' => true])->assertRedirect();
        $this->assertNull($article->fresh()?->cover_image);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_editor_can_publish_another_authors_article(): void
    {
        $editor = User::factory()->editor()->create();
        $article = Article::factory()->create();
        $this->actingAs($editor)->patch(route('admin.articles.status.update', $article), ['status' => 'published'])->assertRedirect();
        $this->assertSame(ArticleStatus::Published, $article->fresh()?->status);
    }

    public function test_admin_can_schedule_a_future_article_using_an_absolute_time(): void
    {
        $this->freezeTime();
        $date = now()->addDay();
        $this->actingAs($this->admin())->post(route('admin.articles.store'), [...$this->payload(), 'status' => 'scheduled', 'published_at' => $date->toIso8601String()])->assertRedirect();
        $article = Article::firstOrFail();
        $this->assertSame(ArticleStatus::Scheduled, $article->status);
        $this->assertSame($date->getTimestamp(), $article->published_at?->getTimestamp());
        $this->assertSame(0, Article::published()->count());
    }

    public function test_oversized_covers_are_rejected(): void
    {
        $this->actingAs($this->admin())->post(route('admin.articles.store'), [...$this->payload(), 'cover_image' => UploadedFile::fake()->image('large.jpg')->size(2049)])->assertSessionHasErrors('cover_image');
        $this->assertDatabaseCount('articles', 0);
    }

    public function test_tags_can_be_created_renamed_and_deleted(): void
    {
        $this->actingAs($this->admin())->post(route('admin.taxonomies.store', ['taxonomy' => 'tags']), ['name' => 'Kajian', 'slug' => 'kajian'])->assertRedirect();
        $tag = Tag::firstOrFail();
        $this->put(route('admin.taxonomies.update', ['taxonomy' => 'tags', 'id' => $tag->id]), ['name' => 'Kajian Kitab', 'slug' => 'kajian-kitab'])->assertRedirect();
        $this->assertDatabaseHas('tags', ['id' => $tag->id, 'name' => 'Kajian Kitab']);
        $this->delete(route('admin.taxonomies.destroy', ['taxonomy' => 'tags', 'id' => $tag->id]))->assertRedirect();
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
    }

    public function test_admin_can_create_update_and_soft_delete_an_article(): void
    {
        $admin = $this->admin();
        $category = Category::factory()->create();
        $this->actingAs($admin)->post(route('admin.articles.store'), [...$this->payload(), 'category_ids' => [$category->id], 'tag_names' => ['Pesantren']])->assertRedirect(route('admin.articles.index'));
        $article = Article::firstOrFail();
        $this->assertSame('kabar-santri', $article->slug);
        $this->assertSame($admin->id, $article->author_id);
        $this->assertSame(1, $article->categories()->count());
        $this->assertSame('pesantren', $article->tags()->first()?->slug);
        $this->put(route('admin.articles.update', $article), [...$this->payload(), 'title' => 'Judul Baru', 'slug' => $article->slug])->assertRedirect();
        $this->assertDatabaseHas('articles', ['id' => $article->id, 'title' => 'Judul Baru', 'slug' => 'kabar-santri']);
        $this->delete(route('admin.articles.destroy', $article))->assertRedirect();
        $this->assertSoftDeleted($article);
    }

    public function test_duplicate_slug_past_schedule_and_non_image_are_rejected(): void
    {
        $article = Article::factory()->create(['slug' => 'sudah-ada']);
        $this->actingAs($this->admin())->post(route('admin.articles.store'), [...$this->payload(), 'slug' => $article->slug, 'status' => 'scheduled', 'published_at' => now()->subDay()->toDateTimeString(), 'cover_image' => UploadedFile::fake()->create('payload.txt', 1, 'text/plain')])
            ->assertSessionHasErrors(['slug', 'published_at', 'cover_image']);
        $this->assertDatabaseCount('articles', 1);
    }

    public function test_schedule_requires_date_and_seo_lengths_are_enforced(): void
    {
        $this->actingAs($this->admin())->post(route('admin.articles.store'), [...$this->payload(), 'status' => 'scheduled', 'meta_title' => str_repeat('a', 71), 'meta_description' => str_repeat('a', 161)])->assertSessionHasErrors(['published_at', 'meta_title', 'meta_description']);
    }

    public function test_unprivileged_users_are_forbidden_and_guests_redirect(): void
    {
        $this->get(route('admin.articles.index'))->assertRedirect(route('login'));
        $this->actingAs(User::factory()->create())->get(route('admin.articles.index'))->assertForbidden();
        $this->post(route('admin.articles.store'), $this->payload())->assertForbidden();
    }

    public function test_author_can_only_edit_their_own_drafts_and_cannot_publish_or_schedule(): void
    {
        $author = User::factory()->author()->create();
        $own = Article::factory()->for($author, 'author')->create();
        $other = Article::factory()->create();
        $this->actingAs($author)->put(route('admin.articles.update', $own), $this->payload())->assertRedirect();
        $this->put(route('admin.articles.update', $other), $this->payload())->assertForbidden();
        $this->patch(route('admin.articles.status.update', $own), ['status' => 'published'])->assertForbidden();
        $this->put(route('admin.articles.update', $own), [...$this->payload(), 'status' => 'scheduled', 'published_at' => now()->addDay()->toDateTimeString()])->assertForbidden();
        $this->post(route('admin.articles.store'), [...$this->payload(), 'status' => 'published'])->assertForbidden();
        $this->post(route('admin.taxonomies.store', ['taxonomy' => 'tags']), ['name' => 'Tag', 'slug' => 'tag'])->assertForbidden();
    }

    public function test_policy_permission_matrix(): void
    {
        $admin = $this->admin();
        $editor = User::factory()->editor()->create();
        $author = User::factory()->author()->create();
        $ordinary = User::factory()->create();
        $own = Article::factory()->for($author, 'author')->create();
        $edited = Article::factory()->for($editor, 'author')->create();
        $this->assertTrue($admin->can('update', $own));
        $this->assertTrue($admin->can('publish', $own));
        $this->assertTrue($editor->can('publish', $edited));
        $this->assertTrue($editor->can('update', $own));
        $this->assertTrue($editor->can('publish', $own));
        $this->assertTrue($author->can('update', $own));
        $this->assertFalse($author->can('publish', $own));
        $this->assertFalse($ordinary->can('viewAny', Article::class));
    }

    public function test_html_is_sanitized_before_storage(): void
    {
        $this->actingAs($this->admin())->post(route('admin.articles.store'), [...$this->payload(), 'content' => '<script>alert(1)</script><p onclick="evil()">Aman</p><img src="https://example.test/photo.png" onerror="evil()"><a href="javascript:evil()">link</a><table><tr><td>data</td></tr></table>'])->assertRedirect();
        $html = Article::firstOrFail()->content;
        $this->assertStringNotContainsString('<script', $html);
        $this->assertStringNotContainsString('onerror', $html);
        $this->assertStringNotContainsString('onclick', $html);
        $this->assertStringNotContainsString('javascript:', $html);
        $this->assertStringContainsString('<p>Aman</p>', $html);
        $this->assertStringContainsString('<table>', $html);
    }

    public function test_sanitizer_preserves_whitelisted_headings_and_lists(): void
    {
        $html = app(ArticleHtmlSanitizer::class)->clean('<h2>Judul</h2><ul><li><strong>Isi</strong></li></ul><iframe src="https://example.test"></iframe>');
        $this->assertStringContainsString('<h2>Judul</h2>', $html);
        $this->assertStringContainsString('<strong>Isi</strong>', $html);
        $this->assertStringNotContainsString('iframe', $html);
    }

    public function test_cover_replacement_removal_and_force_deletion_clean_up_files(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin())->post(route('admin.articles.store'), [...$this->payload(), 'cover_image' => UploadedFile::fake()->image('cover.jpg')])->assertRedirect();
        $article = Article::firstOrFail();
        $first = $article->cover_image;
        Storage::disk('public')->assertExists($first);
        $this->post(route('admin.articles.update', $article), [...$this->payload(), '_method' => 'put', 'cover_image' => UploadedFile::fake()->image('new.webp')])->assertRedirect();
        Storage::disk('public')->assertMissing($first);
        $second = $article->fresh()?->cover_image;
        Storage::disk('public')->assertExists($second);
        $article->refresh()->delete();
        Storage::disk('public')->assertExists($second);
        $article->forceDelete();
        Storage::disk('public')->assertMissing($second);
    }

    public function test_editor_image_upload_is_validated_and_authorized(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin())->postJson(route('admin.articles.images.store'), ['image' => UploadedFile::fake()->image('content.png')])->assertCreated()->assertJsonStructure(['url']);
        $this->postJson(route('admin.articles.images.store'), ['image' => UploadedFile::fake()->create('bad.svg', 1, 'image/svg+xml')])->assertUnprocessable()->assertJsonValidationErrors('image');
        $this->actingAs(User::factory()->create())->postJson(route('admin.articles.images.store'), ['image' => UploadedFile::fake()->image('content.png')])->assertForbidden();
    }

    public function test_taxonomies_support_crud_and_reject_deep_or_circular_hierarchies(): void
    {
        $this->actingAs($this->admin());
        $this->post(route('admin.taxonomies.store', ['taxonomy' => 'categories']), ['name' => 'Pendidikan', 'slug' => 'pendidikan'])->assertRedirect();
        $parent = Category::firstOrFail();
        $this->post(route('admin.taxonomies.store', ['taxonomy' => 'categories']), ['name' => 'Santri', 'slug' => 'santri', 'parent_id' => $parent->id])->assertRedirect();
        $child = Category::where('slug', 'santri')->firstOrFail();
        $this->post(route('admin.taxonomies.store', ['taxonomy' => 'categories']), ['name' => 'Cucu', 'slug' => 'cucu', 'parent_id' => $child->id])->assertSessionHasErrors('parent_id');
        $this->put(route('admin.taxonomies.update', ['taxonomy' => 'categories', 'id' => $parent->id]), ['name' => 'Pendidikan', 'slug' => 'pendidikan', 'parent_id' => $child->id])->assertSessionHasErrors('parent_id');
        $this->put(route('admin.taxonomies.update', ['taxonomy' => 'categories', 'id' => $child->id]), ['name' => 'Santri Baru', 'slug' => 'santri-baru', 'parent_id' => $parent->id])->assertRedirect();
        $this->delete(route('admin.taxonomies.destroy', ['taxonomy' => 'categories', 'id' => $child->id]))->assertRedirect();
        $this->assertDatabaseMissing('categories', ['id' => $child->id]);
    }

    public function test_admin_can_publish_unpublish_and_archive(): void
    {
        $article = Article::factory()->create();
        $this->actingAs($this->admin());
        $this->patch(route('admin.articles.status.update', $article), ['status' => 'published'])->assertRedirect();
        $this->assertSame(ArticleStatus::Published, $article->fresh()?->status);
        $this->assertNotNull($article->fresh()?->published_at);
        $this->patch(route('admin.articles.status.update', $article), ['status' => 'draft'])->assertRedirect();
        $this->assertSame(ArticleStatus::Draft, $article->fresh()?->status);
        $this->patch(route('admin.articles.status.update', $article), ['status' => 'archived'])->assertRedirect();
        $this->assertSame(ArticleStatus::Archived, $article->fresh()?->status);
    }
}
