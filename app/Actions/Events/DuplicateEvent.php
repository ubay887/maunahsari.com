<?php

namespace App\Actions\Events;

use App\EventStatus;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class DuplicateEvent
{
    public function handle(Event $original, User $organizer): Event
    {
        $banner = null;
        if ($original->banner && Storage::disk('public')->exists($original->banner)) {
            $banner = 'events/'.Str::uuid().'.'.pathinfo($original->banner, PATHINFO_EXTENSION);
            if (! Storage::disk('public')->copy($original->banner, $banner)) {
                abort(500, 'Banner belum dapat disalin.');
            }
        }
        try {
            return DB::transaction(function () use ($original, $organizer, $banner): Event {
                $copy = $original->replicate(['slug', 'banner', 'deleted_at']);
                $start = $original->start_at->addWeek()->max(now()->addWeek())->startOfMinute();
                $copy->fill([
                    'title' => Str::limit($original->title, 245, '').' (Salinan)',
                    'status' => EventStatus::Draft, 'organizer_id' => $organizer->id, 'banner' => $banner,
                    'start_at' => $start, 'end_at' => $start->addSeconds($original->start_at->diffInSeconds($original->end_at)),
                ]);
                $copy->save();
                $copy->categories()->sync($original->categories()->allRelatedIds());

                return $copy;
            });
        } catch (Throwable $exception) {
            if ($banner) {
                Storage::disk('public')->delete($banner);
            }
            throw $exception;
        }
    }
}
