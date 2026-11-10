<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Services\AlumniPrivacy;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PhotoController extends Controller
{
    public function __invoke(#[CurrentUser] User $user, AlumniProfile $profile, AlumniPrivacy $privacy): StreamedResponse
    {
        $data = $privacy->profile($profile, $user, false);
        abort_unless(isset($data['photo']) && $profile->photo_path && Storage::disk('local')->exists($profile->photo_path), 404);

        return Storage::disk('local')->response($profile->photo_path, headers: ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
