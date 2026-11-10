<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Events\SaveEvent;
use App\EventStatus;
use App\EventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventIndexRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Category;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(EventIndexRequest $request): Response
    {
        Gate::authorize('viewAny', Event::class);
        $sort = $request->input('sort') ?: 'created_at';
        $direction = $request->input('direction') ?: 'desc';
        $query = Event::query()->with(['categories:id,name,slug', 'organizer:id,name'])->search($request->string('search')->toString());
        foreach (['status', 'type'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->string($field)->toString());
            }
        }
        if ($request->filled('date_from')) {
            $query->where('start_at', '>=', CarbonImmutable::parse($request->string('date_from')->toString(), 'Asia/Jakarta')->startOfDay()->utc());
        }
        if ($request->filled('date_to')) {
            $query->where('start_at', '<=', CarbonImmutable::parse($request->string('date_to')->toString(), 'Asia/Jakarta')->endOfDay()->utc());
        }

        return Inertia::render('admin/events/index', [
            'events' => $query->select(['id', 'title', 'slug', 'summary', 'banner', 'start_at', 'end_at', 'timezone', 'type', 'status', 'location_name', 'contact_whatsapp', 'organizer_id', 'created_at', 'updated_at'])->orderBy($sort, $direction)->orderByDesc('id')->paginate($request->integer('per_page', 10))->withQueryString(),
            'filters' => [
                'search' => $request->string('search')->toString(), 'status' => $request->string('status')->toString(),
                'type' => $request->string('type')->toString(), 'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(), 'sort' => $sort, 'direction' => $direction,
            ],
        ]);
    }

    public function show(Event $event): Response
    {
        Gate::authorize('view', $event);

        return Inertia::render('admin/events/show', ['event' => $event->load(['categories:id,name,slug', 'organizer:id,name'])]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Event::class);

        return Inertia::render('admin/events/create', $this->formProps());
    }

    public function store(StoreEventRequest $request, SaveEvent $save): RedirectResponse
    {
        $save->handle($request, new Event);

        return to_route('admin.events.index')->with('success', 'Event berhasil disimpan.');
    }

    public function edit(Event $event): Response
    {
        Gate::authorize('update', $event);

        return Inertia::render('admin/events/edit', [
            ...$this->formProps(), 'event' => $event->load('categories'),
            'startLocal' => $event->start_at->setTimezone('Asia/Jakarta')->format('Y-m-d\TH:i'),
            'endLocal' => $event->end_at->setTimezone('Asia/Jakarta')->format('Y-m-d\TH:i'),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event, SaveEvent $save): RedirectResponse
    {
        $save->handle($request, $event);

        return to_route('admin.events.index')->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        Gate::authorize('delete', $event);
        $event->delete();

        return to_route('admin.events.index')->with('success', 'Event dihapus.');
    }

    /** @return array<string, mixed> */
    private function formProps(): array
    {
        return [
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug', 'parent_id']),
            'statuses' => array_map(fn (EventStatus $status): array => ['value' => $status->value, 'label' => $status->label()], EventStatus::cases()),
            'types' => array_map(fn (EventType $type): array => ['value' => $type->value, 'label' => $type->label()], EventType::cases()),
        ];
    }
}
