<?php

namespace App\Observers;

use App\Models\AlumniProfile;
use App\Services\AlumniMapCache;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class AlumniProfileObserver implements ShouldHandleEventsAfterCommit
{
    public function saved(AlumniProfile $profile): void
    {
        AlumniMapCache::invalidate();
    }

    public function deleted(AlumniProfile $profile): void
    {
        AlumniMapCache::invalidate();
    }
}
