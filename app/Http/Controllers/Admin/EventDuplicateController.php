<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Events\DuplicateEvent;
use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EventDuplicateController extends Controller
{
    public function __invoke(Request $request, Event $event, DuplicateEvent $duplicate): RedirectResponse
    {
        Gate::authorize('create', Event::class);
        $user = $request->user();
        abort_unless($user !== null, 403);
        $copy = $duplicate->handle($event, $user);

        return to_route('admin.events.edit', $copy)->with('success', 'Salinan draf dibuat. Periksa kembali jadwalnya.');
    }
}
