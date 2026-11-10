<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Psb\QuotaLock;
use App\Actions\Psb\SaveApplicantDocument;
use App\DocumentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApplicantDocumentRequest;
use App\Models\Applicant;
use App\Models\ApplicantDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicantDocumentController extends Controller
{
    public function show(Request $request, ApplicantDocument $document): StreamedResponse
    {
        Gate::authorize('view', $document);
        abort_if($document->applicant()->doesntExist() || ! Storage::disk('local')->exists($document->path), 404);
        $headers = ['Content-Type' => $document->mime, 'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff'];

        return Storage::disk('local')->response($document->path, $document->original_name, $headers, $request->boolean('download') ? 'attachment' : 'inline');
    }

    public function store(ApplicantDocumentRequest $request, Applicant $applicant, SaveApplicantDocument $save): RedirectResponse
    {
        $file = $request->file('document');
        abort_unless($file instanceof UploadedFile, 422);
        $save->handle($applicant, DocumentType::from($request->string('type')->toString()), $file);

        return back()->with('success', 'Berkas disimpan; verifikasi ulang diperlukan.');
    }

    public function verify(ApplicantDocument $document, QuotaLock $lock): RedirectResponse
    {
        Gate::authorize('update', $document);
        DB::transaction(function () use ($document, $lock): void {
            $applicant = $document->applicant;
            abort_unless($applicant instanceof Applicant, 404);
            $lock->period($applicant->registration_period_id);
            $fresh = $applicant->documents()->whereKey($document->id)->lockForUpdate()->firstOrFail();
            abort_unless(Storage::disk('local')->exists($fresh->path), 404);
            $fresh->update(['is_verified' => true, 'verified_at' => now(), 'verified_by' => auth()->id()]);
        });

        return back()->with('success', 'Berkas terverifikasi.');
    }

    public function destroy(Applicant $applicant, ApplicantDocument $document, SaveApplicantDocument $save): RedirectResponse
    {
        Gate::authorize('update', $applicant);
        abort_unless($document->applicant_id === $applicant->id, 404);
        $save->handle($applicant, $document->type, null);

        return back()->with('success', 'Berkas dihapus.');
    }
}
