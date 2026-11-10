<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Alumni\VerifyProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\VerificationRequest;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class AlumniVerificationController extends Controller
{
    public function __invoke(VerificationRequest $request, #[CurrentUser] User $admin, AlumniProfile $profile, VerifyProfile $verify): RedirectResponse
    {
        Gate::authorize('update', $profile);
        $verify->handle($admin, $profile, $request->validated());

        return back()->with('success', 'Status verifikasi tersimpan.');
    }
}
