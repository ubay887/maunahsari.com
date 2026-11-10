<?php

namespace App\Actions\Alumni;

use App\ContactRequestStatus;
use App\Models\AlumniProfile;
use App\Models\ContactRequest;
use App\Models\User;
use App\Services\AlumniPrivacy;
use App\VerificationStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ManageContactRequest
{
    public function __construct(private AlumniPrivacy $privacy) {}

    public function send(User $user, AlumniProfile $target, string $message): void
    {
        DB::transaction(function () use ($user, $target, $message): void {
            $own = $user->alumniProfile()->lockForUpdate()->firstOrFail();
            abort_unless($own->verification_status === VerificationStatus::Approved && $own->id !== $target->id && $target->user_id !== null && $this->privacy->discoverable()->whereKey($target->id)->exists(), 403);
            ContactRequest::where('requester_profile_id', $own->id)->where('status', ContactRequestStatus::Pending)->where('expires_at', '<=', now())->update(['status' => ContactRequestStatus::Expired->value, 'responded_at' => now()]);
            if (ContactRequest::where('requester_profile_id', $own->id)->whereDate('created_at', now()->toDateString())->count() >= config('alumni.contact_daily_limit')) {
                throw ValidationException::withMessages(['message' => 'Batas permintaan kontak harian tercapai.']);
            }
            if (ContactRequest::where('requester_profile_id', $own->id)->where('target_profile_id', $target->id)->where('status', ContactRequestStatus::Pending)->exists()) {
                throw ValidationException::withMessages(['message' => 'Permintaan masih menunggu jawaban.']);
            }
            ContactRequest::create(['requester_profile_id' => $own->id, 'target_profile_id' => $target->id, 'message' => $message, 'expires_at' => now()->addDays(30)]);
        });
    }

    public function respond(User $user, ContactRequest $contact, string $status): void
    {
        DB::transaction(function () use ($user, $contact, $status): void {
            $contact = ContactRequest::whereKey($contact->id)->lockForUpdate()->firstOrFail();
            abort_unless($contact->target_profile_id === $user->alumniProfile?->id, 403);
            if ($contact->status !== ContactRequestStatus::Pending || $contact->expires_at?->isPast()) {
                throw ValidationException::withMessages(['status' => 'Permintaan sudah dijawab atau kedaluwarsa.']);
            }
            $contact->update(['status' => $status, 'responded_at' => now()]);
        });
    }
}
