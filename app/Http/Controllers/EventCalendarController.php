<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\EventCalendar;
use Illuminate\Http\Response;

class EventCalendarController extends Controller
{
    public function __invoke(Event $event, EventCalendar $calendar): Response
    {
        abort_unless(Event::published()->whereKey($event->id)->exists(), 404);

        return response($calendar->ics($event), 200, [
            'Content-Type' => 'text/calendar; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$event->slug.'.ics"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
