<?php

namespace Tests\Feature;

use App\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Database\Seeders\ArticleSeeder;
use Database\Seeders\DemoUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_slugs_are_unique_stable_and_reserve_soft_deleted_slugs(): void
    {
        $first = Article::factory()->create(['title' => 'Kabar Santri']);
        $first->update(['title' => 'Judul Baru']);
        $this->assertSame('kabar-santri', $first->slug);
        $first->delete();
        $second = Article::factory()->create(['title' => 'Kabar Santri']);
        $this->assertSame('kabar-santri-2', $second->slug);
        $second->update(['slug' => 'slug-pilihan']);
        $this->assertSame('slug-pilihan', $second->fresh()?->slug);
    }

    public function test_published_scope_includes_only_due_articles_and_search_is_grouped(): void
    {
        $this->freezeTime();
        Article::factory()->create(['title' => 'Santri draf']);
        Article::factory()->scheduled()->create(['title' => 'Santri mendatang']);
        $published = Article::factory()->published()->create(['title' => 'Kegiatan Santri']);
        $due = Article::factory()->create(['title' => 'Santri terjadwal', 'status' => ArticleStatus::Scheduled, 'published_at' => now()->subMinute()]);
        Article::factory()->published()->create(['title' => 'Berita lainnya', 'excerpt' => 'Tidak cocok']);
        $this->assertSame([$published->id, $due->id], Article::published()->search('Santri')->orderBy('id')->pluck('id')->all());
    }

    public function test_taxonomy_and_author_relationships_work(): void
    {
        $parent = Category::factory()->create();
        $category = Category::factory()->for($parent, 'parent')->create();
        $tag = Tag::factory()->create();
        $article = Article::factory()->hasAttached($category)->hasAttached($tag)->create();
        $this->assertTrue($article->categories->first()?->is($category));
        $this->assertTrue($tag->articles->first()?->is($article));
        $this->assertTrue($parent->children->first()?->is($category));
        $this->assertTrue($article->author->articles->first()?->is($article));
    }

    public function test_article_seeder_is_repeatable_and_creates_published_site_content(): void
    {
        $this->seed([DemoUserSeeder::class, ArticleSeeder::class]);
        $this->seed(ArticleSeeder::class);
        $this->assertDatabaseCount('articles', 5);
        $this->assertDatabaseCount('categories', 4);
        $this->assertDatabaseCount('tags', 4);
        $this->assertSame(5, Article::published()->count());
        $this->assertDatabaseHas('articles', ['slug' => 'pendaftaran-santri-baru-2026-2027', 'status' => ArticleStatus::Published->value]);
    }
}
