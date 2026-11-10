<?php

namespace App\Actions\Alumni;

use App\Models\AlumniProfile;
use App\Services\AlumniPhotos;
use App\Services\AlumniPrivacy;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SaveAdminProfile
{
    public function __construct(private AlumniPhotos $photos) {}

    /** @param array<string, mixed> $data */
    public function handle(array $data, ?AlumniProfile $profile = null, ?UploadedFile $photo = null): AlumniProfile
    {
        $profile ??= new AlumniProfile(['source' => 'admin', 'verification_status' => 'pending']);
        $oldPhoto = $profile->photo_path;
        $profile->fill(array_intersect_key($data, array_flip([...AlumniPrivacy::EDITABLE, 'santri_id'])));
        if ($photo) {
            $profile->photo_path = $this->photos->store($photo);
        } elseif ($data['remove_photo'] ?? false) {
            $profile->photo_path = null;
        }
        $profile->save();
        if ($oldPhoto && $oldPhoto !== $profile->photo_path) {
            Storage::disk('local')->delete($oldPhoto);
        }

        return $profile;
    }
}
