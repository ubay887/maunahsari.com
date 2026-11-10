<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApplicantVisitRequest;
use App\Models\Applicant;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;

class ApplicantVisitController extends Controller
{
    public function __invoke(ApplicantVisitRequest $request, Applicant $applicant): RedirectResponse
    {
        $data = $request->validated();
        foreach (['visit_scheduled_at', 'visited_at', 'sowan_done_at'] as $key) {
            if (! empty($data[$key])) {
                $data[$key] = CarbonImmutable::parse($data[$key], 'Asia/Jakarta')->utc();
            }
        }
        $applicant->update($data);

        return back()->with('success', 'Catatan sowan berhasil disimpan.');
    }
}
