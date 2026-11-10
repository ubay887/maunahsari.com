<?php

namespace App\Services;

use App\EventStatus;
use App\EventType;
use App\Models\Event;
use Illuminate\Support\Str;

class EventSeo
{
    /** @return array<string, mixed> */
    public function metadata(Event $event, bool $preview): array
    {
        $description = $event->meta_description ?: Str::limit(html_entity_decode(strip_tags($event->summary ?: $event->description), ENT_QUOTES | ENT_HTML5, 'UTF-8'), 160, '');
        $locations = [];
        if ($event->type !== EventType::Online) {
            $locations[] = ['@type' => 'Place', 'name' => $event->location_name, 'address' => $event->address];
        }
        if ($event->type !== EventType::Offline) {
            $locations[] = ['@type' => 'VirtualLocation', 'url' => $event->meeting_url];
        }
        $schema = [
            '@context' => 'https://schema.org', '@type' => 'Event', 'name' => $event->title,
            'description' => $description, 'url' => route('events.show', $event->slug),
            'startDate' => $event->start_at->setTimezone($event->timezone)->toIso8601String(),
            'endDate' => $event->end_at->setTimezone($event->timezone)->toIso8601String(),
            'eventStatus' => 'https://schema.org/'.($event->status === EventStatus::Cancelled ? 'EventCancelled' : 'EventScheduled'),
            'eventAttendanceMode' => 'https://schema.org/'.match ($event->type) {
                EventType::Offline => 'OfflineEventAttendanceMode', EventType::Online => 'OnlineEventAttendanceMode', EventType::Hybrid => 'MixedEventAttendanceMode',
            },
            'location' => count($locations) === 1 ? $locations[0] : $locations,
            'organizer' => ['@type' => 'Organization', 'name' => config('app.name'), 'url' => route('home')],
        ];
        if ($event->banner_url) {
            $schema['image'] = [$event->banner_url];
        }

        return [
            'title' => $event->meta_title ?: $event->title, 'description' => $description,
            'canonical' => route('events.show', $event->slug), 'image' => $event->banner_url, 'preview' => $preview,
            'schema' => $preview ? null : json_encode($schema, JSON_THROW_ON_ERROR | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];
    }
}
