<?php

namespace Tests\Feature;

use App\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicArticleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_index_and_detail_hide_drafts_future_schedules_and_archives(): void
    {
        $draft = Article::factory()->create();
        $future = Article::factory()->scheduled()->create();
        $archived = Article::factory()->create(['status' => ArticleStatus::Archived]);
        $published = Article::factory()->published()->create();
        $due = Article::factory()->scheduled()->create(['published_at' => now()->subMinute()]);
        $this->get(route('articles.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('articles/index')->has('articles.data', 2)->where('articles.data.0.id', $due->id)->where('articles.data.1.id', $published->id));
        $this->get(route('articles.show', $draft->slug))->assertNotFound();
        $this->get(route('articles.show', $future->slug))->assertNotFound();
        $this->get(route('articles.show', $archived->slug))->assertNotFound();
        $this->get(route('articles.show', $published->slug))->assertOk();
        $published->delete();
        $this->get(route('articles.show', $published->slug))->assertNotFound();
    }

    public function test_search_category_and_tag_filters_can_be_combined(): void
    {
        $category = Category::factory()->create();
        $tag = Tag::factory()->create();
        $match = Article::factory()->published()->hasAttached($category)->hasAttached($tag)->create(['title' => 'Santri Berprestasi']);
        Article::factory()->published()->create(['title' => 'Santri lainnya']);
        Article::factory()->hasAttached($category)->hasAttached($tag)->create(['title' => 'Santri draf']);
        $this->get(route('articles.index', ['search' => 'Santri', 'category' => $category->slug, 'tag' => $tag->slug]))
            ->assertInertia(fn (Assert $page) => $page->has('articles.data', 1)->where('articles.data.0.id', $match->id)->where('filters.category', $category->slug));
        $this->get(route('articles.index', ['search' => 'tidak-ada']))->assertInertia(fn (Assert $page) => $page->has('articles.data', 0));
    }

    public function test_pagination_returns_twelve_articles_per_page(): void
    {
        $author = User::factory()->admin()->create();
        Article::factory()->count(13)->for($author, 'author')->published()->create();
        $this->get(route('articles.index'))->assertInertia(fn (Assert $page) => $page->has('articles.data', 12)->where('articles.total', 13));
        $this->get(route('articles.index', ['page' => 2]))->assertInertia(fn (Assert $page) => $page->has('articles.data', 1)->where('articles.current_page', 2));
    }

    public function test_preview_requires_permission_and_does_not_count_views(): void
    {
        $author = User::factory()->author()->create();
        $draft = Article::factory()->for($author, 'author')->create();
        $url = route('articles.show', ['article' => $draft->slug, 'preview' => 1]);
        $this->get($url)->assertNotFound();
        $this->actingAs(User::factory()->create())->get($url)->assertNotFound();
        $this->actingAs($author)->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page->where('preview', true));
        $this->assertSame(0, $draft->fresh()?->views_count);
    }

    public function test_detail_includes_metadata_and_at_most_three_related_published_articles(): void
    {
        $category = Category::factory()->create();
        $article = Article::factory()->published()->hasAttached($category)->create(['meta_title' => 'Judul SEO', 'meta_description' => 'Deskripsi SEO']);
        Article::factory()->count(4)->published()->hasAttached($category)->create();
        Article::factory()->hasAttached($category)->create();
        $this->get(route('articles.show', $article->slug))->assertInertia(fn (Assert $page) => $page->component('articles/show')->where('description', 'Deskripsi SEO')->where('article.meta_title', 'Judul SEO')->where('canonical', route('articles.show', $article->slug))->has('related', 3));
    }

    public function test_unverified_author_cannot_preview_private_articles(): void
    {
        $author = User::factory()->author()->unverified()->create();
        $draft = Article::factory()->for($author, 'author')->create();
        $this->actingAs($author)->get(route('articles.show', ['article' => $draft->slug, 'preview' => 1]))->assertNotFound();
    }

    public function test_views_increment_for_readers_but_ignore_bots(): void
    {
        $article = Article::factory()->published()->create();
        $updatedAt = $article->updated_at?->toDateTimeString();
        $this->withHeader('User-Agent', 'Mozilla/5.0')->get(route('articles.show', $article->slug))->assertOk();
        $this->withHeader('User-Agent', 'Googlebot')->get(route('articles.show', $article->slug))->assertOk();
        $this->assertSame(1, $article->fresh()?->views_count);
        $this->assertSame($updatedAt, $article->fresh()?->updated_at?->toDateTimeString());
    }

    public function test_rss_and_sitemap_are_valid_xml_and_only_include_public_articles(): void
    {
        $published = Article::factory()->published()->create(['title' => 'Santri & Pendidikan <Aman>']);
        $draft = Article::factory()->create();
        $future = Article::factory()->scheduled()->create();
        $feed = $this->get(route('articles.feed'))->assertOk()->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
        $rss = simplexml_load_string($feed->getContent());
        $this->assertNotFalse($rss);
        $this->assertSame('Santri & Pendidikan <Aman>', (string) $rss->channel->item->title);
        $this->assertSame(route('articles.show', $published->slug), (string) $rss->channel->item->link);
        $this->assertStringNotContainsString($draft->slug, $feed->getContent());
        $this->assertStringNotContainsString($future->slug, $feed->getContent());
        $map = $this->get(route('articles.sitemap'))->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $xml = $map->streamedContent();
        $this->assertNotFalse(simplexml_load_string($xml));
        $this->assertStringContainsString(route('articles.show', $published->slug), $xml);
        $this->assertStringNotContainsString($draft->slug, $xml);
    }

    public function test_command_publishes_only_due_scheduled_articles_and_is_repeatable(): void
    {
        $this->freezeTime();
        $due = Article::factory()->scheduled()->create(['published_at' => now()]);
        $future = Article::factory()->scheduled()->create();
        $draft = Article::factory()->create();
        $deleted = Article::factory()->scheduled()->create(['published_at' => now()->subMinute()]);
        $deleted->delete();
        $this->artisan('articles:publish-scheduled')->expectsOutput('1 artikel diterbitkan.')->assertSuccessful();
        $this->assertSame(ArticleStatus::Published, $due->fresh()?->status);
        $this->assertSame(ArticleStatus::Scheduled, $future->fresh()?->status);
        $this->assertSame(ArticleStatus::Draft, $draft->fresh()?->status);
        $this->assertSame(ArticleStatus::Scheduled, Article::withTrashed()->findOrFail($deleted->id)->status);
        $this->artisan('articles:publish-scheduled')->expectsOutput('0 artikel diterbitkan.')->assertSuccessful();
    }
}
