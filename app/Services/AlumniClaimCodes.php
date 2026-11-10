<?php

namespace App\Services;

use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AlumniClaimCodes
{
    public function issue(AlumniProfile $profile, User $admin): ?string
    {
        return DB::transaction(function () use ($profile, $admin): ?string {
            $record = AlumniProfile::whereKey($profile->id)->where('source', 'import')->whereNull('user_id')->whereNull('claimed_at')->lockForUpdate()->first();
            if ($record === null) {
                return null;
            }
            $code = Str::random(40);
            $record->update(['claim_code_hash' => hash('sha256', $code)]);
            AuditLog::create(['actor_id' => $admin->id, 'action' => 'claim.generated', 'subject_type' => 'alumni_profile', 'subject_id' => $record->id]);

            return $code;
        });
    }
}
