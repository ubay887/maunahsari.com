<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Psb\DeleteApplicant;
use App\Actions\Psb\SaveApplicant;
use App\Actions\Psb\SubmitApplication;
use App\ApplicantSource;
use App\DocumentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminApplicantRequest;
use App\Http\Requests\ApplicantIndexRequest;
use App\Models\Applicant;
use App\Models\User;
use App\Services\ApplicantQuery;
use App\Services\PsbData;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicantController extends Controller
{
    public function index(ApplicantIndexRequest $request, ApplicantQuery $query, PsbData $data): Response
    {
        return Inertia::render('admin/psb/applicants/index', [...$data->formProps(), 'applicants' => $query->filtered($request)->paginate($request->integer('per_page', 10))->withQueryString(), 'filters' => $request->safe()->except(['page', 'per_page'])]);
    }

    public function create(PsbData $data): Response
    {
        Gate::authorize('create', Applicant::class);

        return Inertia::render('admin/psb/applicants/create', $data->formProps());
    }

    public function store(AdminApplicantRequest $request, SubmitApplication $submit): RedirectResponse
    {
        $files = [];
        foreach (DocumentType::cases() as $type) {
            $file = $request->file('documents.'.$type->value);
            if ($file instanceof UploadedFile) {
                $files[$type->value] = $file;
            }
        }
        $applicant = $submit->handle($request->safe()->except('documents'), $files, ApplicantSource::Offline, $request->user());

        return to_route('admin.psb.applicants.show', $applicant)->with('success', 'Pendaftaran luring berhasil disimpan.');
    }

    public function show(Applicant $applicant): Response
    {
        Gate::authorize('view', $applicant);

        return Inertia::render('admin/psb/applicants/show', ['applicant' => $applicant->load(['program', 'registrationPeriod', 'documents', 'payments', 'statusHistories.actor:id,name', 'santri', 'province', 'city', 'district', 'village'])]);
    }

    public function edit(Applicant $applicant, PsbData $data): Response
    {
        Gate::authorize('update', $applicant);

        return Inertia::render('admin/psb/applicants/edit', [...$data->formProps($applicant), 'applicant' => $applicant]);
    }

    public function update(AdminApplicantRequest $request, Applicant $applicant, SaveApplicant $save): RedirectResponse
    {
        $save->handle($applicant, $request->safe()->except('documents'));

        return to_route('admin.psb.applicants.show', $applicant)->with('success', 'Biodata berhasil diperbarui.');
    }

    public function destroy(Applicant $applicant, #[CurrentUser] User $actor, DeleteApplicant $delete): RedirectResponse
    {
        Gate::authorize('delete', $applicant);
        $delete->handle($applicant, $actor);

        return to_route('admin.psb.applicants.index')->with('success', 'Pendaftar dihapus.');
    }

    public function export(ApplicantIndexRequest $request, ApplicantQuery $query): StreamedResponse
    {
        return response()->streamDownload(function () use ($request, $query): void {
            $stream = fopen('php://output', 'w');
            if ($stream === false) {
                return;
            }
            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, ['Nomor registrasi', 'Nama', 'Pondok', 'Program', 'Status', 'Jenis santri', 'Sumber', 'WhatsApp wali'], ',', '"', '');
            foreach ($query->filtered($request)->lazy(200) as $applicant) {
                $cells = [$applicant->registration_number, $applicant->full_name, $applicant->pondok->value, $applicant->program->name, $applicant->status->label(), $applicant->residence_type->value, $applicant->source->value, $applicant->guardian_phone];
                fputcsv($stream, array_map(fn (string $value): string => preg_match('/^[=+@\-\t\r\n]/', $value) ? "'".$value : $value, $cells), ',', '"', '');
            }
            fclose($stream);
        }, 'pendaftar-psb.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'private, no-store']);
    }
}
