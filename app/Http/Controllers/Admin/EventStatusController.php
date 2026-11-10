<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventStatusRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;

class EventStatusController extends Controller
{
    public function __invoke(EventStatusRequest $request, Event $event): RedirectResponse
    {
        $event->update($request->safe()->only('status'));

        return back()->with('success', 'Status event berhasil diperbarui.');
    }
}
