<?php

namespace App\Http\Controllers\Admin;

use App\ApplicantStatus;
use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Services\PsbData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PsbDashboardController extends Controller
{
    public function __invoke(Request $request, PsbData $data): Response
    {
        Gate::authorize('viewAny', Applicant::class);
        $periodId = $request->integer('registration_period_id') ?: $data->activePeriod()?->id;
        $counts = Applicant::where('registration_period_id', $periodId)->selectRaw('status, COUNT(*) AS total')->groupBy('status')->pluck('total', 'status');

        return Inertia::render('admin/psb/dashboard', [...$data->formProps(), 'periodId' => $periodId, 'quotas' => $data->quotas($periodId), 'counts' => collect(ApplicantStatus::cases())->mapWithKeys(fn (ApplicantStatus $status): array => [$status->value => (int) ($counts[$status->value] ?? 0)])]);
    }
}
