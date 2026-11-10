<?php

namespace App\Actions\Alumni;

use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteProfile
{
    public function handle(AlumniProfile $profile, User $admin): void
    {
        $photo = $profile->photo_path;
        DB::transaction(function () use ($profile, $admin): void {
            $profile->forceDelete();
            AuditLog::create(['actor_id' => $admin->id, 'action' => 'profile.deleted', 'meta' => ['scope' => 'alumni']]);
        });
        if ($photo) {
            Storage::disk('local')->delete($photo);
        }
    }
}
