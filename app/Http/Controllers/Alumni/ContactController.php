<?php

namespace App\Http\Controllers\Alumni;

use App\Actions\Alumni\ManageContactRequest;
use App\ContactRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\ContactRequestRequest;
use App\Http\Requests\Alumni\RespondContactRequest;
use App\Models\AlumniProfile;
use App\Models\ContactRequest;
use App\Models\User;
use App\Services\AlumniPrivacy;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(#[CurrentUser] User $user, AlumniPrivacy $privacy): Response
    {
        $id = $user->alumniProfile()->firstOrFail()->id;
        ContactRequest::where('status', ContactRequestStatus::Pending)->where('expires_at', '<=', now())->where(fn ($query) => $query->where('requester_profile_id', $id)->orWhere('target_profile_id', $id))->update(['status' => ContactRequestStatus::Expired->value, 'responded_at' => now()]);
        $contacts = ContactRequest::where(fn ($query) => $query->where('requester_profile_id', $id)->orWhere('target_profile_id', $id))->latest()->paginate(20)->through(fn (ContactRequest $contact): array => $privacy->contact($contact, $user));

        return Inertia::render('alumni/contacts', ['contacts' => $contacts]);
    }

    public function store(ContactRequestRequest $request, #[CurrentUser] User $user, AlumniProfile $profile, ManageContactRequest $manage): RedirectResponse
    {
        $manage->send($user, $profile, $request->string('message')->toString());

        return back()->with('success', 'Permintaan kontak terkirim.');
    }

    public function update(RespondContactRequest $request, #[CurrentUser] User $user, ContactRequest $contact, ManageContactRequest $manage): RedirectResponse
    {
        $manage->respond($user, $contact, $request->string('status')->toString());

        return back()->with('success', 'Jawaban tersimpan.');
    }

    public function show(#[CurrentUser] User $user, ContactRequest $contact, AlumniPrivacy $privacy): JsonResponse
    {
        return response()->json($privacy->approvedContact($contact, $user))->header('Cache-Control', 'private, no-store');
    }
}
