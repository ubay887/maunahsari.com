<?php

namespace App\Actions\Alumni;

use App\Models\AlumniProfile;
use App\Models\User;
use App\VerificationStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClaimProfile
{
    public function handle(User $user, string $code): void
    {
        DB::transaction(function () use ($user, $code): void {
            $profile = AlumniProfile::whereNull('user_id')->whereNull('claimed_at')->where('source', 'import')->where('claim_code_hash', hash('sha256', $code))->lockForUpdate()->first();
            if ($profile === null || $user->alumniProfile()->exists()) {
                throw ValidationException::withMessages(['code' => 'Kode tidak berlaku atau akun sudah memiliki profil.']);
            }
            $profile->fill(['user_id' => $user->id, 'claim_code_hash' => null, 'claimed_at' => now(), 'verification_status' => VerificationStatus::Approved, 'verified_at' => now(), 'rejection_reason' => null, 'map_mode' => null, 'directory_visible' => null, 'field_visibility' => []])->save();
        });
    }
}
