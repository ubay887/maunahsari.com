<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApplicantPaymentRequest;
use App\Models\Applicant;
use App\Models\ApplicantPayment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ApplicantPaymentController extends Controller
{
    public function store(ApplicantPaymentRequest $request, #[CurrentUser] User $user, Applicant $applicant): RedirectResponse
    {
        $applicant->payments()->create([...$request->validated(), 'paid_at' => CarbonImmutable::parse($request->string('paid_at')->toString(), 'Asia/Jakarta')->utc(), 'recorded_by' => $user->id]);

        return back()->with('success', 'Administrasi berhasil dicatat.');
    }

    public function destroy(Applicant $applicant, ApplicantPayment $payment): RedirectResponse
    {
        Gate::authorize('update', $applicant);
        abort_unless($payment->applicant_id === $applicant->id, 404);
        $payment->delete();

        return back()->with('success', 'Catatan administrasi dihapus.');
    }
}
