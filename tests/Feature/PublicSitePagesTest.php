<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Article;
use App\Models\RegistrationPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicSitePagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_lists_only_the_six_latest_published_articles_and_the_open_period(): void
    {
        Article::factory()->count(7)->published()->create();
        Article::factory()->create();
        Article::factory()->scheduled()->create();
        $period = RegistrationPeriod::factory()->create();
        RegistrationPeriod::factory()->create(['is_open' => false, 'name' => 'Tutup']);

        $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('articles', 6)
            ->where('period.id', $period->id)
            ->where('period.academic_year', '2026/2027'));
    }

    public function test_home_has_no_period_when_registration_is_closed(): void
    {
        RegistrationPeriod::factory()->create(['is_open' => false]);

        $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('articles', 0)
            ->where('period', null));
    }

    public function test_home_counts_only_approved_alumni_and_exposes_canonical(): void
    {
        AlumniProfile::factory()->count(3)->approved()->create();
        AlumniProfile::factory()->create();

        $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('alumniCount', 3)
            ->where('canonical', route('home')));
    }

    public function test_sitemap_lists_the_static_pages(): void
    {
        $body = $this->get(route('articles.sitemap'))->assertOk()->streamedContent();

        foreach (['home', 'site.profile', 'site.pondok.putra', 'site.pondok.putri', 'site.contact', 'articles.index', 'events.index'] as $name) {
            $this->assertStringContainsString('<loc>'.route($name).'</loc>', $body);
        }
    }

    public function test_unknown_pages_render_the_branded_error_page(): void
    {
        $this->get('/halaman-yang-tidak-ada')->assertNotFound()->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404));
    }

    /** @return array<string, array{string, string, array<string, string>}> */
    public static function staticPages(): array
    {
        return [
            'profil' => ['site.profile', 'site/profil', []],
            'pondok putra' => ['site.pondok.putra', 'site/pondok', ['pondok' => 'putra']],
            'pondok putri' => ['site.pondok.putri', 'site/pondok', ['pondok' => 'putri']],
            'narahubung' => ['site.contact', 'site/narahubung', []],
        ];
    }

    /** @param array<string, string> $props */
    #[DataProvider('staticPages')]
    public function test_static_pages_are_public_and_render_their_component(string $route, string $component, array $props): void
    {
        $response = $this->get(route($route))->assertOk()->assertInertia(fn (Assert $page) => $page->component($component)->where('canonical', route($route)));

        foreach ($props as $key => $value) {
            $response->assertInertia(fn (Assert $page) => $page->where($key, $value));
        }
    }
}
