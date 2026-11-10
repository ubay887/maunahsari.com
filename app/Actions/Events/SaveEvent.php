<?php

namespace App\Actions\Events;

use App\EventType;
use App\Http\Requests\StoreEventRequest;
use App\Models\Event;
use App\Services\ArticleHtmlSanitizer;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class SaveEvent
{
    public function __construct(private ArticleHtmlSanitizer $sanitizer) {}

    public function handle(StoreEventRequest $request, Event $event): Event
    {
        $oldBanner = $event->banner;
        $newBanner = $request->file('banner')?->store('events', 'public');
        try {
            DB::transaction(function () use ($request, $event, $newBanner): void {
                $attributes = $request->safe()->except(['category_ids', 'banner', 'remove_banner']);
                if ($event->exists && ($attributes['slug'] ?? null) === null) {
                    unset($attributes['slug']);
                }
                $attributes['description'] = $this->sanitizer->clean($request->string('description')->toString());
                if (trim(html_entity_decode(strip_tags($attributes['description']), ENT_QUOTES | ENT_HTML5, 'UTF-8')) === '' && ! str_contains($attributes['description'], '<img ')) {
                    throw ValidationException::withMessages(['description' => 'Deskripsi event wajib diisi.']);
                }
                foreach (['start_at', 'end_at'] as $field) {
                    $attributes[$field] = CarbonImmutable::parse($request->string($field)->toString(), $request->string('timezone')->toString())->utc();
                }
                if ($request->input('type') === EventType::Online->value) {
                    $attributes['location_name'] = $attributes['address'] = $attributes['map_url'] = null;
                } elseif ($request->input('type') === EventType::Offline->value) {
                    $attributes['meeting_url'] = null;
                }
                if ($newBanner) {
                    $attributes['banner'] = $newBanner;
                } elseif ($request->boolean('remove_banner')) {
                    $attributes['banner'] = null;
                }
                if (! $event->exists) {
                    $attributes['organizer_id'] = $request->user()?->id;
                }
                $event->fill($attributes)->save();
                $event->categories()->sync($request->array('category_ids'));
            });
        } catch (Throwable $exception) {
            if ($newBanner) {
                Storage::disk('public')->delete($newBanner);
            }
            throw $exception;
        }
        if ($oldBanner && ($newBanner || $request->boolean('remove_banner'))) {
            Storage::disk('public')->delete($oldBanner);
        }

        return $event;
    }
}
