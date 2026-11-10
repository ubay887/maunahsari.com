<?php

namespace App\Http\Controllers\Alumni;

use App\Actions\Alumni\SaveProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\ProfileRequest;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Services\AlumniOptions;
use App\Services\AlumniPrivacy;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(#[CurrentUser] User $user, AlumniPrivacy $privacy, AlumniOptions $options): Response
    {
        Gate::authorize('create', AlumniProfile::class);
        $profile = $user->alumniProfile;

        return Inertia::render('alumni/profile', ['profile' => $profile ? $privacy->profile($profile, $user) : null, ...$options->get()]);
    }

    public function update(ProfileRequest $request, #[CurrentUser] User $user, SaveProfile $save): RedirectResponse
    {
        $save->handle($user, $request->validated(), $request->file('photo'));

        return redirect()->route('alumni.home')->with('success', 'Profil diajukan untuk verifikasi.');
    }
}
