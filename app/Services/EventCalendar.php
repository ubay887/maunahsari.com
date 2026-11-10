<?php

namespace App\Services;

use App\EventStatus;
use App\Models\Event;

class EventCalendar
{
    public function googleUrl(Event $event): string
    {
        return 'https://calendar.google.com/calendar/render?'.http_build_query([
            'action' => 'TEMPLATE', 'text' => $event->title,
            'dates' => $event->start_at->utc()->format('Ymd\THis\Z').'/'.$event->end_at->utc()->format('Ymd\THis\Z'),
            'ctz' => $event->timezone,
            'details' => $this->description($event),
            'location' => $this->location($event),
        ], '', '&', PHP_QUERY_RFC3986);
    }

    public function ics(Event $event): string
    {
        $lines = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maunahsari//Event//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
            'X-WR-TIMEZONE:'.$this->escape($event->timezone), 'BEGIN:VEVENT',
            'UID:event-'.$event->id.'@'.parse_url(route('events.index'), PHP_URL_HOST),
            'DTSTAMP:'.($event->updated_at ?? now())->utc()->format('Ymd\THis\Z'),
            'DTSTART:'.$event->start_at->utc()->format('Ymd\THis\Z'),
            'DTEND:'.$event->end_at->utc()->format('Ymd\THis\Z'),
            'SUMMARY:'.$this->escape($event->title),
            'DESCRIPTION:'.$this->escape($this->description($event)),
            'LOCATION:'.$this->escape($this->location($event)),
            'URL:'.route('events.show', $event->slug),
            'STATUS:'.($event->status === EventStatus::Cancelled ? 'CANCELLED' : 'CONFIRMED'),
            'END:VEVENT', 'END:VCALENDAR',
        ];

        return implode("\r\n", array_map($this->fold(...), $lines))."\r\n";
    }

    private function description(Event $event): string
    {
        return html_entity_decode(strip_tags($event->summary ?: $event->description), ENT_QUOTES | ENT_HTML5, 'UTF-8')."\nZona waktu: ".$event->timezone."\n".route('events.show', $event->slug);
    }

    private function location(Event $event): string
    {
        return implode(' — ', array_filter([$event->location_name, $event->address, $event->meeting_url]));
    }

    private function escape(string $value): string
    {
        return str_replace(['\\', "\r\n", "\r", "\n", ';', ','], ['\\\\', '\n', '\n', '\n', '\;', '\,'], $value);
    }

    private function fold(string $line): string
    {
        $parts = [];
        $limit = 75;
        while (strlen($line) > $limit) {
            $part = mb_strcut($line, 0, $limit, 'UTF-8');
            $parts[] = $part;
            $line = substr($line, strlen($part));
            $limit = 74;
        }
        $parts[] = $line;

        return implode("\r\n ", $parts);
    }
}
