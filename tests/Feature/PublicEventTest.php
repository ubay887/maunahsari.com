<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicEventTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_tabs_partition_events_include_ongoing_and_hide_drafts_and_deleted_events(): void
    {
        $this->freezeTime();
        $future = Event::factory()->published()->create();
        $ongoing = Event::factory()->published()->ongoing()->create();
        $past = Event::factory()->published()->past()->create();
        $draft = Event::factory()->create();
        $deleted = Event::factory()->published()->create();
        $deleted->delete();
        $this->get(route('events.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('events/index')->where('filters.tab', 'upcoming')->has('events.data', 2)->where('events.data.0.id', $ongoing->id)->where('events.data.1.id', $future->id));
        $this->get(route('events.index', ['tab' => 'past']))->assertOk()->assertInertia(fn (Assert $page) => $page->has('events.data', 1)->where('events.data.0.id', $past->id));
        $this->get(route('events.show', $draft->slug))->assertNotFound();
        $this->get(route('events.show', $deleted->slug))->assertNotFound();
        $this->get(route('events.show', $future->slug))->assertOk()->assertInertia(fn (Assert $page) => $page->component('events/show')->where('preview', false));
    }

    public function test_only_admin_can_preview_drafts_and_preview_is_noindex(): void
    {
        $draft = Event::factory()->create();
        $url = route('events.show', ['event' => $draft->slug, 'preview' => 1]);
        $this->get($url)->assertNotFound();
        $this->actingAs(User::factory()->create())->get($url)->assertNotFound();
        $editor = User::factory()->editor()->create();
        $this->actingAs($editor)->get($url)->assertNotFound();
        $admin = User::factory()->admin()->create(['email' => 'admin@example.test']);
        $this->actingAs($admin)->get($url)->assertOk()->assertSee('noindex,nofollow', false)->assertInertia(fn (Assert $page) => $page->where('preview', true)->where('schema', null));
    }

    public function test_search_category_and_type_filters_combine_without_leaking_drafts(): void
    {
        $category = Category::factory()->create();
        $match = Event::factory()->published()->online()->hasAttached($category)->create(['title' => 'Kajian pendidikan']);
        Event::factory()->published()->online()->create(['title' => 'Kajian tanpa kategori']);
        Event::factory()->published()->hasAttached($category)->create(['title' => 'Kajian luring']);
        Event::factory()->online()->hasAttached($category)->create(['title' => 'Kajian draf']);
        $this->get(route('events.index', ['search' => 'Kajian', 'category' => $category->slug, 'type' => 'online']))->assertOk()->assertInertia(fn (Assert $page) => $page->has('events.data', 1)->where('events.data.0.id', $match->id));
        $this->get(route('events.index', ['search' => 'tidak-ada']))->assertInertia(fn (Assert $page) => $page->has('events.data', 0));
    }

    public function test_pagination_returns_twelve_events_and_preserves_filters(): void
    {
        $organizer = User::factory()->create();
        Event::factory()->count(13)->for($organizer, 'organizer')->published()->online()->create(['title' => 'Kajian']);
        $this->get(route('events.index', ['type' => 'online', 'search' => 'Kajian']))->assertInertia(fn (Assert $page) => $page->has('events.data', 12)->where('events.total', 13));
        $this->get(route('events.index', ['type' => 'online', 'search' => 'Kajian', 'page' => 2]))->assertInertia(fn (Assert $page) => $page->has('events.data', 1)->where('events.current_page', 2)->where('filters.type', 'online'));
    }

    public function test_cancelled_event_remains_public_with_cancelled_schema_and_calendar_status(): void
    {
        $event = Event::factory()->cancelled()->create();
        $this->get(route('events.index'))->assertInertia(fn (Assert $page) => $page->where('events.data.0.status', 'cancelled'));
        $response = $this->get(route('events.show', $event->slug))->assertOk()->assertInertia(fn (Assert $page) => $page->where('event.status', 'cancelled'));
        $response->assertSee('https://schema.org/EventCancelled', false);
        $this->get(route('events.calendar', $event->slug))->assertOk()->assertSee('STATUS:CANCELLED', false);
    }

    public function test_detail_supplies_external_links_metadata_and_nearest_three_active_events(): void
    {
        $this->freezeTime();
        $event = Event::factory()->published()->online()->create([
            'meta_title' => 'Kajian SEO', 'meta_description' => 'Deskripsi SEO',
            'registration_url' => 'https://forms.gle/demo', 'contact_whatsapp' => '6281234567890',
            'start_at' => '2027-01-10 02:00:00', 'end_at' => '2027-01-10 04:00:00',
        ]);
        $nearest = Event::factory()->published()->create(['start_at' => now()->addHour(), 'end_at' => now()->addHours(3)]);
        Event::factory()->count(4)->published()->create();
        Event::factory()->create();
        Event::factory()->cancelled()->create();
        Event::factory()->published()->past()->create();
        $response = $this->get(route('events.show', $event->slug))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('event.registration_url', 'https://forms.gle/demo')
            ->where('event.meeting_url', 'https://meet.google.com/abc-defg-hij')
            ->where('whatsappUrl', 'https://wa.me/6281234567890')
            ->where('description', 'Deskripsi SEO')->where('canonical', route('events.show', $event->slug))
            ->has('upcomingEvents', 3)->where('upcomingEvents.0.id', $nearest->id));
        $response->assertSee('<meta data-inertia="og:title" property="og:title" content="Kajian SEO">', false);
        $response->assertSee('application/ld+json', false);
        preg_match('/<script data-inertia="event-schema" type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);
        $schema = json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('Event', $schema['@type']);
        $this->assertSame('2027-01-10T09:00:00+07:00', $schema['startDate']);
        $this->assertSame('VirtualLocation', $schema['location']['@type']);
        $this->assertSame('https://schema.org/OnlineEventAttendanceMode', $schema['eventAttendanceMode']);
        parse_str(parse_url($response->inertiaProps('googleCalendarUrl'), PHP_URL_QUERY), $calendarQuery);
        $this->assertSame('20270110T020000Z/20270110T040000Z', $calendarQuery['dates']);
        $this->assertSame('Asia/Jakarta', $calendarQuery['ctz']);
    }

    public function test_hybrid_json_ld_has_physical_and_virtual_locations_and_inert_script_content(): void
    {
        $event = Event::factory()->published()->create(['type' => 'hybrid', 'meeting_url' => 'https://meet.google.com/abc-defg-hij', 'title' => '</script><script>alert(1)</script>']);
        $response = $this->get(route('events.show', $event->slug))->assertOk();
        preg_match('/<script data-inertia="event-schema" type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);
        $this->assertStringNotContainsString('</script>', $matches[1]);
        $schema = json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('Place', $schema['location'][0]['@type']);
        $this->assertSame('VirtualLocation', $schema['location'][1]['@type']);
    }

    public function test_sitemap_keeps_articles_and_adds_public_events_only(): void
    {
        $article = Article::factory()->published()->create();
        $published = Event::factory()->published()->create();
        $cancelled = Event::factory()->cancelled()->create();
        $draft = Event::factory()->create();
        $deleted = Event::factory()->published()->create();
        $deleted->delete();
        $xml = $this->get(route('articles.sitemap'))->assertOk()->streamedContent();
        $this->assertNotFalse(simplexml_load_string($xml));
        foreach ([route('articles.show', $article->slug), route('events.show', $published->slug), route('events.show', $cancelled->slug)] as $url) {
            $this->assertStringContainsString($url, $xml);
        }
        $this->assertStringNotContainsString($draft->slug, $xml);
        $this->assertStringNotContainsString($deleted->slug, $xml);
    }

    public function test_ics_contains_absolute_utc_times_original_timezone_and_crlf_lines(): void
    {
        $event = Event::factory()->published()->online()->create([
            'title' => 'Kajian, ilmu; bersama', 'summary' => "Baris pertama\nBaris kedua",
            'start_at' => '2027-01-10 02:00:00', 'end_at' => '2027-01-10 04:00:00', 'timezone' => 'Asia/Jayapura',
        ]);
        $response = $this->get(route('events.calendar', $event->slug))->assertOk()
            ->assertHeader('Content-Type', 'text/calendar; charset=UTF-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="'.$event->slug.'.ics"');
        $ics = $response->getContent();
        $this->assertStringStartsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n", $ics);
        $this->assertStringEndsWith("END:VEVENT\r\nEND:VCALENDAR\r\n", $ics);
        $this->assertStringContainsString("DTSTART:20270110T020000Z\r\nDTEND:20270110T040000Z", $ics);
        $this->assertStringContainsString('X-WR-TIMEZONE:Asia/Jayapura', $ics);
        $this->assertStringContainsString('SUMMARY:Kajian\, ilmu\; bersama', $ics);
        $this->assertStringContainsString('DESCRIPTION:Baris pertama\nBaris kedua', $ics);
        $this->assertStringContainsString('UID:event-'.$event->id.'@', $ics);
        $this->assertStringContainsString('DTSTAMP:', $ics);
        $this->assertStringContainsString('STATUS:CONFIRMED', $ics);
    }

    public function test_ics_folds_utf8_lines_without_injection_and_private_events_return_404(): void
    {
        $event = Event::factory()->published()->create(['title' => str_repeat('Kajian ilmu é ', 16)."\nBEGIN:VEVENT", 'summary' => 'Belajar bersama']);
        $ics = $this->get(route('events.calendar', $event->slug))->assertOk()->getContent();
        foreach (explode("\r\n", $ics) as $line) {
            $this->assertLessThanOrEqual(75, strlen($line));
            $this->assertTrue(mb_check_encoding($line, 'UTF-8'));
        }
        $this->assertSame(1, substr_count($ics, "\r\nBEGIN:VEVENT\r\n"));
        $draft = Event::factory()->create();
        $this->get(route('events.calendar', $draft->slug))->assertNotFound();
        $event->delete();
        $this->get(route('events.calendar', $event->slug))->assertNotFound();
    }
}
