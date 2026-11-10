<?php

namespace App\Http\Controllers\Psb;

use App\Actions\Psb\UpdateOwnApplication;
use App\Http\Controllers\Controller;
use App\Http\Requests\PortalProfileRequest;
use App\Models\User;
use App\Services\ApplicantPortal;
use App\Services\PsbFormData;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PortalProfileController extends Controller
{
    public function edit(#[CurrentUser] User $user, ApplicantPortal $portal, PsbFormData $formData): Response
    {
        $applicant = $user->applicant;
        abort_if($applicant === null, 404);
        $applicant->loadMissing('program');

        return Inertia::render('psb/portal/profile', [
            ...$formData->options($applicant),
            'applicant' => $applicant->only(['id', 'registration_number', 'registration_period_id', 'program_id', 'residence_type', 'status', 'full_name', 'nickname', 'nik', 'gender', 'birth_place', 'birth_date', 'address', 'province_code', 'city_code', 'district_code', 'village_code', 'rt', 'rw', 'postal_code', 'last_education', 'hafalan_juz', 'can_read_binnadhor', 'can_write_pegon', 'guardian_name', 'guardian_relation', 'guardian_phone']) + ['program' => $applicant->program],
            'summary' => $portal->summary($applicant),
        ]);
    }

    public function update(PortalProfileRequest $request, #[CurrentUser] User $user, UpdateOwnApplication $update): RedirectResponse
    {
        $applicant = $user->applicant;
        abort_if($applicant === null, 404);
        $update->handle($applicant, $request->validated());

        return to_route('psb.portal.home')->with('success', 'Data pendaftaran diperbarui.');
    }
}
