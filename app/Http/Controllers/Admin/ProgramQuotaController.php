<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Psb\SaveProgramQuota;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProgramQuotaRequest;
use App\Models\ProgramQuota;
use App\Services\PsbData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProgramQuotaController extends Controller
{
    public function index(Request $request, PsbData $data): Response
    {
        Gate::authorize('viewAny', ProgramQuota::class);
        $periodId = $request->integer('registration_period_id') ?: $data->activePeriod()?->id;

        return Inertia::render('admin/psb/quotas/index', [...$data->formProps(), 'quotas' => $data->quotas($periodId), 'periodId' => $periodId]);
    }

    public function store(ProgramQuotaRequest $request, SaveProgramQuota $save): RedirectResponse
    {
        $save->handle($request->validated());

        return back()->with('success', 'Kuota berhasil disimpan.');
    }
}
