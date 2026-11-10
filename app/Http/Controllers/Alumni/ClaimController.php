<?php

namespace App\Http\Controllers\Alumni;

use App\Actions\Alumni\ClaimProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\ClaimRequest;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClaimController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('alumni/claim');
    }

    public function store(ClaimRequest $request, #[CurrentUser] User $user, ClaimProfile $claim): RedirectResponse
    {
        $claim->handle($user, $request->string('code')->toString());

        return redirect()->route('alumni.privacy.edit')->with('success', 'Profil berhasil diklaim. Pilih privasi Anda.');
    }
}
