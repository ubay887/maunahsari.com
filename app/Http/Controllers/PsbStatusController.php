<?php

namespace App\Http\Controllers;

use App\ApplicantStatus;
use App\Http\Requests\PsbStatusRequest;
use App\Models\Applicant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PsbStatusController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('psb/status', ['result' => $request->session()->get('psb_status_result')]);
    }

    public function store(PsbStatusRequest $request): RedirectResponse
    {
        $applicant = Applicant::where('registration_number', $request->string('registration_number')->toString())->where('guardian_phone', $request->string('guardian_phone')->toString())->first();
        if ($applicant === null) {
            $request->session()->forget('psb_status_result');
            throw ValidationException::withMessages(['registration_number' => 'Nomor registrasi atau WhatsApp wali tidak cocok.']);
        }

        return to_route('psb.status.index')->with('psb_status_result', ['status' => $applicant->status->value, 'status_label' => $applicant->status->label(), 'visit_scheduled_at' => $applicant->visit_scheduled_at?->toIso8601String(), 'decision_reason' => $applicant->status === ApplicantStatus::Rejected ? $applicant->decision_reason : null]);
    }
}
