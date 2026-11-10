<?php

namespace App\Http\Controllers\Psb;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApplicantPortal;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\Inertia;
use Inertia\Response;

class PortalPaymentController extends Controller
{
    public function index(#[CurrentUser] User $user, ApplicantPortal $portal): Response
    {
        $applicant = $user->applicant;
        abort_if($applicant === null, 404);

        return Inertia::render('psb/portal/payments', ['applicant' => $portal->summary($applicant), 'payments' => $portal->payments($applicant)]);
    }
}
