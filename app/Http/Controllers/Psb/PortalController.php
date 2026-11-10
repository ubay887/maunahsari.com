<?php

namespace App\Http\Controllers\Psb;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApplicantPortal;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function index(#[CurrentUser] User $user, ApplicantPortal $portal): Response
    {
        $applicant = $user->applicant;

        return Inertia::render('psb/portal/home', [
            'applicant' => $applicant ? $portal->summary($applicant) : null,
            'documents' => $applicant ? $portal->documents($applicant) : [],
            'history' => $applicant ? $portal->history($applicant) : [],
        ]);
    }

    public function receipt(#[CurrentUser] User $user, ApplicantPortal $portal): Response
    {
        $applicant = $user->applicant;
        abort_if($applicant === null, 404);

        return Inertia::render('psb/portal/receipt', ['applicant' => $portal->summary($applicant)]);
    }
}
