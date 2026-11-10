<?php

namespace App\Actions\Alumni;

use App\Models\AlumniProfile;
use App\Models\ConsentRecord;
use App\Models\User;
use App\Services\AlumniPhotos;
use App\Services\AlumniPrivacy;
use App\VerificationStatus;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SaveProfile
{
    public function __construct(private AlumniPhotos $photos) {}

    /** @param array<string, mixed> $data */
    public function handle(User $user, array $data, ?UploadedFile $photo = null): AlumniProfile
    {
        $oldPhoto = $user->alumniProfile?->photo_path;
        $newPhoto = $photo ? $this->photos->store($photo) : null;
        try {
            $profile = DB::transaction(function () use ($user, $data, $newPhoto): AlumniProfile {
                $profile = AlumniProfile::where('user_id', $user->id)->lockForUpdate()->first() ?? new AlumniProfile(['user_id' => $user->id, 'source' => 'self']);
                $profile->fill(array_intersect_key($data, array_flip(AlumniPrivacy::EDITABLE)));
                $profile->verification_status = VerificationStatus::Pending;
                $profile->verified_at = null;
                $profile->verified_by = null;
                $profile->rejection_reason = null;
                if ($newPhoto) {
                    $profile->photo_path = $newPhoto;
                } elseif ($data['remove_photo'] ?? false) {
                    $profile->photo_path = null;
                }
                $profile->save();
                $this->privacy($user, $profile, $data);

                return $profile;
            });
        } catch (\Throwable $error) {
            if ($newPhoto) {
                Storage::disk('local')->delete($newPhoto);
            } throw $error;
        }
        if ($oldPhoto && $oldPhoto !== $profile->photo_path) {
            Storage::disk('local')->delete($oldPhoto);
        }

        return $profile;
    }

    /** @param array<string, mixed> $data */
    public function privacy(User $user, AlumniProfile $profile, array $data): void
    {
        DB::transaction(function () use ($user, $profile, $data): void {
            $profile->fill(array_intersect_key($data, array_flip(['map_mode', 'directory_visible', 'field_visibility'])))->save();
            foreach (['privacy_policy' => true, 'map_display' => $data['map_mode'] !== 'hidden', 'directory_display' => (bool) $data['directory_visible']] as $type => $granted) {
                ConsentRecord::create(['user_id' => $user->id, 'profile_id' => $profile->id, 'type' => $type, 'version' => config('alumni.privacy_version'), 'granted' => $granted, 'recorded_at' => now()]);
            }
        });
    }
}
