<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Psb\ChangeApplicantStatus;
use App\ApplicantStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApplicantStatusRequest;
use App\Models\Applicant;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;

class ApplicantStatusController extends Controller
{
    public function __invoke(ApplicantStatusRequest $request, #[CurrentUser] User $user, Applicant $applicant, ChangeApplicantStatus $change): RedirectResponse
    {
        $change->handle($applicant, ApplicantStatus::from($request->string('status')->toString()), $user, $request->input('decision_reason'));

        return back()->with('success', 'Status pendaftar diperbarui.');
    }
}
