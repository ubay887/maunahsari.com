<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Article;
use App\Models\Category;
use App\Models\Event;
use App\Models\Santri;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDetailPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_admin_sees_article_detail_with_relations(): void
    {
        $article = Article::factory()->create();
        $article->categories()->attach(Category::factory()->create(['name' => 'Kabar']));
        $article->tags()->attach(Tag::factory()->create(['name' => 'Pondok']));

        $this->actingAs(User::factory()->admin()->create())->get(route('admin.articles.show', $article))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/articles/show')->where('article.id', $article->id)
            ->has('article.author')->where('article.categories.0.name', 'Kabar')->where('article.tags.0.name', 'Pondok')
            ->where('canUpdate', true));
    }

    public function test_author_sees_only_their_own_article_detail(): void
    {
        $author = User::factory()->author()->create();
        $own = Article::factory()->for($author, 'author')->create();
        $other = Article::factory()->create();

        $this->actingAs($author)->get(route('admin.articles.show', $own))->assertOk();
        $this->get(route('admin.articles.show', $other))->assertForbidden();
    }

    public function test_article_list_exposes_the_extra_column_data(): void
    {
        $article = Article::factory()->create(['views_count' => 7]);
        $article->tags()->attach(Tag::factory()->create());

        $this->actingAs(User::factory()->admin()->create())->get(route('admin.articles.index', ['sort' => 'views_count']))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('articles.data.0.views_count', 7)->has('articles.data.0.tags', 1)->has('articles.data.0.updated_at')->where('filters.sort', 'views_count'));
    }

    public function test_event_detail_and_list_columns(): void
    {
        $event = Event::factory()->published()->create(['location_name' => 'Aula Utama']);

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get(route('admin.events.show', $event))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/events/show')->where('event.id', $event->id)->has('event.organizer')->has('event.categories'));
        $this->get(route('admin.events.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('events.data.0.location_name', 'Aula Utama')->has('events.data.0.organizer')->has('events.data.0.created_at'));
        $this->actingAs(User::factory()->editor()->create())->get(route('admin.events.show', $event))->assertForbidden();
    }

    public function test_alumni_detail_is_admin_only_and_list_carries_more_attributes(): void
    {
        $profile = AlumniProfile::factory()->create(['profession' => 'Dokter']);

        $this->actingAs(User::factory()->create())->get(route('admin.alumni.show', $profile))->assertForbidden();
        $this->actingAs(User::factory()->admin()->create())->get(route('admin.alumni.show', $profile))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/alumni/show')->where('profile.id', $profile->id)->where('profile.profession', 'Dokter')->has('profile.verification_status'));
        $this->get(route('admin.alumni.index'))->assertInertia(fn (Assert $page) => $page
            ->where('profiles.data.0.profession', 'Dokter')->has('profiles.data.0.created_at')->has('profiles.data.0.map_mode'));
    }

    public function test_alumni_show_route_does_not_swallow_static_admin_pages(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        foreach (['admin.alumni.create', 'admin.alumni.statistics', 'admin.alumni.import.index'] as $route) {
            $this->get(route($route))->assertOk();
        }
    }

    public function test_taxonomy_lists_count_their_usage_and_name_the_parent(): void
    {
        $parent = Category::factory()->create(['name' => 'Induk']);
        $child = Category::factory()->create(['parent_id' => $parent->id]);
        $article = Article::factory()->create();
        $article->categories()->attach($child);
        $event = Event::factory()->create();
        $event->categories()->attach($child);

        $this->actingAs(User::factory()->admin()->create())->get(route('admin.taxonomies.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('categories', 2)->where('categories.1.parent.name', 'Induk')->where('categories.1.articles_count', 1)->where('categories.1.events_count', 1));
    }

    public function test_santri_list_links_back_to_the_registration_and_city(): void
    {
        $santri = Santri::factory()->create();

        $this->actingAs(User::factory()->admin()->create())->get(route('admin.santri.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('santris.data.0.id', $santri->id)->where('santris.data.0.applicant.id', $santri->applicant_id)->has('santris.data.0.applicant.registration_number'));
    }
}
