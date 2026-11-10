<?php

namespace App\Http\Controllers;

use App\EventStatus;
use App\Http\Requests\EventIndexRequest;
use App\Models\Category;
use App\Models\Event;
use App\Services\EventCalendar;
use App\Services\EventSeo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(EventIndexRequest $request): Response
    {
        $tab = $request->input('tab') === 'past' ? 'past' : 'upcoming';
        $query = Event::published()->with('categories:id,name,slug')->search($request->string('search')->toString());
        if ($tab === 'past') {
            $query->past();
        } else {
            $query->upcoming();
        }
        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }
        if ($request->filled('category')) {
            $query->whereHas('categories', fn (Builder $query): Builder => $query->where('slug', $request->string('category')->toString()));
        }
        $canonical = route('events.index', $request->only(['search', 'category', 'type', 'tab', 'page']));

        return Inertia::render('events/index', [
            'events' => $query->select(['id', 'title', 'slug', 'summary', 'banner', 'start_at', 'end_at', 'timezone', 'type', 'status', 'location_name'])->orderBy('start_at', $tab === 'past' ? 'desc' : 'asc')->orderBy('id')->paginate(12)->withQueryString(),
            'categories' => Category::whereHas('events', fn (Builder $query): Builder => $query->published())->orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => ['search' => $request->string('search')->toString(), 'category' => $request->string('category')->toString(), 'type' => $request->string('type')->toString(), 'tab' => $tab],
            'canonical' => $canonical,
        ])->withViewData('eventMeta', [
            'title' => 'Event', 'description' => 'Jadwal kajian, pendidikan, dan kegiatan Pesantren Maunahsari.',
            'canonical' => $canonical, 'image' => null, 'preview' => false, 'schema' => null,
        ]);
    }

    public function show(Request $request, Event $event, EventSeo $seo, EventCalendar $calendar): Response
    {
        $published = Event::published()->whereKey($event->id)->exists();
        $user = $request->user();
        $canPreview = $user !== null && $user->hasVerifiedEmail() && $user->can('view', $event);
        abort_unless($published || $canPreview, 404);
        $preview = ! $published || ($canPreview && $request->boolean('preview'));
        $event->load(['organizer:id,name', 'categories:id,name,slug']);
        $meta = $seo->metadata($event, $preview);
        $canonical = route('events.show', $event->slug);

        return Inertia::render('events/show', [
            'event' => $event, 'preview' => $preview, 'canonical' => $canonical,
            'description' => $meta['description'], 'schema' => $meta['schema'],
            'shareUrl' => 'https://wa.me/?text='.rawurlencode($event->title.' '.$canonical),
            'whatsappUrl' => $event->contact_whatsapp ? 'https://wa.me/'.$event->contact_whatsapp : null,
            'googleCalendarUrl' => $calendar->googleUrl($event),
            'upcomingEvents' => Event::published()->upcoming()->where('status', EventStatus::Published)->whereKeyNot($event->id)->with('categories:id,name,slug')
                ->select(['id', 'title', 'slug', 'summary', 'banner', 'start_at', 'end_at', 'timezone', 'type', 'status', 'location_name'])
                ->orderBy('start_at')->orderBy('id')->limit(3)->get(),
        ])->withViewData('eventMeta', $meta);
    }
}
