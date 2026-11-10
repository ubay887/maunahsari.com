<?php

namespace App\Http\Controllers\Alumni;

use App\Actions\Alumni\SaveProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\PrivacyRequest;
use App\Models\User;
use App\Services\AlumniOptions;
use App\Services\AlumniPrivacy;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyController extends Controller
{
    public function edit(#[CurrentUser] User $user, AlumniPrivacy $privacy, AlumniOptions $options): Response
    {
        $profile = $user->alumniProfile()->firstOrFail();

        return Inertia::render('alumni/privacy', ['profile' => $privacy->profile($profile, $user), ...$options->get()]);
    }

    public function update(PrivacyRequest $request, #[CurrentUser] User $user, SaveProfile $save): RedirectResponse
    {
        $save->privacy($user, $user->alumniProfile()->firstOrFail(), $request->validated());

        return back()->with('success', 'Pengaturan privasi tersimpan.');
    }
}
