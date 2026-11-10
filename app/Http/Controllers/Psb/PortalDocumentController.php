<?php

namespace App\Http\Controllers\Psb;

use App\Actions\Psb\SaveApplicantDocument;
use App\DocumentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\PortalDocumentRequest;
use App\Models\ApplicantDocument;
use App\Models\User;
use App\Services\ApplicantPortal;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PortalDocumentController extends Controller
{
    public function index(#[CurrentUser] User $user, ApplicantPortal $portal): Response
    {
        $applicant = $user->applicant;
        abort_if($applicant === null, 404);

        return Inertia::render('psb/portal/documents', ['applicant' => $portal->summary($applicant), 'documents' => $portal->documents($applicant)]);
    }

    public function store(PortalDocumentRequest $request, #[CurrentUser] User $user, SaveApplicantDocument $save): RedirectResponse
    {
        $applicant = $user->applicant;
        $file = $request->file('document');
        abort_unless($applicant !== null && $file instanceof UploadedFile, 422);
        $save->handle($applicant, DocumentType::from($request->string('type')->toString()), $file, onlyWhileRegistered: true);

        return back()->with('success', 'Berkas disimpan; menunggu verifikasi pengurus.');
    }

    public function show(Request $request, ApplicantDocument $document): StreamedResponse
    {
        abort_unless(Gate::allows('view', $document) && Storage::disk('local')->exists($document->path), 404);
        $headers = ['Content-Type' => $document->mime, 'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff'];

        return Storage::disk('local')->response($document->path, $document->original_name, $headers, $request->boolean('download') ? 'attachment' : 'inline');
    }
}
