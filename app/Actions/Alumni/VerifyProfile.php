<?php

namespace App\Actions\Alumni;

use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class VerifyProfile
{
    /** @param array<string, mixed> $data */
    public function handle(User $admin, AlumniProfile $profile, array $data): void
    {
        DB::transaction(function () use ($admin, $profile, $data): void {
            $profile->fill(['verification_status' => $data['status'], 'verified_by' => $admin->id, 'verified_at' => now(), 'rejection_reason' => $data['status'] === 'rejected' ? $data['rejection_reason'] : null]);
            if (array_key_exists('santri_id', $data)) {
                $profile->santri_id = $data['santri_id'];
            }
            $profile->save();
            AuditLog::create(['actor_id' => $admin->id, 'action' => 'profile.'.$data['status'], 'subject_type' => 'alumni_profile', 'subject_id' => $profile->id]);
        });
    }
}
