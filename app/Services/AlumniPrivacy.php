<?php

namespace App\Services;

use App\ContactRequestStatus;
use App\MapMode;
use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\ConsentRecord;
use App\Models\ContactRequest;
use App\Models\User;
use App\UserRole;
use App\VerificationStatus;
use App\Visibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Gate;

/** The single output boundary for alumni records. Never serialize a profile directly. */
class AlumniPrivacy
{
    public function canBrowse(User $user): bool
    {
        $profile = $user->alumniProfile;

        return $user->role === UserRole::Alumni && $user->hasVerifiedEmail() && $profile?->verification_status === VerificationStatus::Approved && $profile->map_mode !== null && $profile->directory_visible !== null;
    }

    public const FIELDS = ['full_name', 'gender', 'photo', 'entry_year', 'leave_year', 'pondok', 'program', 'alumni_status', 'angkatan', 'province', 'regency', 'activity_status', 'profession', 'organization', 'field', 'skills', 'bio', 'social_links', 'open_to'];

    public const EDITABLE = ['full_name', 'gender', 'phone_whatsapp', 'entry_year', 'leave_year', 'pondok', 'program_id', 'alumni_status', 'angkatan', 'province_id', 'regency_id', 'activity_status', 'profession', 'organization', 'field', 'skills', 'bio', 'social_links', 'open_to'];

    /** @return Builder<AlumniProfile> */
    public function discoverable(): Builder
    {
        return AlumniProfile::query()->where('verification_status', VerificationStatus::Approved)->where('map_mode', MapMode::Visible)->where('directory_visible', true);
    }

    /**
     * In-memory equivalent of {@see self::discoverable()} for an already loaded profile,
     * so listings do not run one existence query per row.
     */
    public function isDiscoverable(AlumniProfile $profile): bool
    {
        return ! $profile->trashed()
            && $profile->verification_status === VerificationStatus::Approved
            && $profile->map_mode === MapMode::Visible
            && $profile->directory_visible === true;
    }

    /** @return Builder<AlumniProfile> */
    public function mappable(): Builder
    {
        return AlumniProfile::query()->where('verification_status', VerificationStatus::Approved)->whereIn('map_mode', [MapMode::Visible, MapMode::Anonymous]);
    }

    public function fieldAllowed(AlumniProfile $profile, string $field): bool
    {
        return in_array(($profile->field_visibility ?? [])[$field] ?? Visibility::Private->value, [Visibility::Alumni->value, Visibility::Public->value], true);
    }

    /** @return array<string, mixed> */
    public function profile(AlumniProfile $profile, User $viewer, bool $includeContact = true): array
    {
        Gate::forUser($viewer)->authorize('view', $profile);
        $owner = $profile->user_id === $viewer->id;
        $privileged = $owner || $viewer->isAdmin();
        if (! $privileged) {
            abort_unless($this->isDiscoverable($profile), 404);
        }
        $data = ['id' => $profile->id];
        foreach (self::FIELDS as $field) {
            if (! $privileged && ! $this->fieldAllowed($profile, $field)) {
                continue;
            }
            $data[$field] = match ($field) {
                'photo' => $profile->photo_path ? route('alumni.photo', $profile) : null,
                'province' => $profile->province?->name,
                'regency' => $profile->regency?->name,
                'program' => $profile->program?->name,
                'social_links' => array_filter($profile->social_links ?? []),
                default => $profile->getAttribute($field) instanceof \BackedEnum ? $profile->getAttribute($field)->value : $profile->getAttribute($field),
            };
        }
        if ($privileged) {
            foreach (['user_id', 'santri_id', 'program_id', 'province_id', 'regency_id', 'phone_whatsapp', 'verification_status', 'verified_at', 'rejection_reason', 'map_mode', 'directory_visible', 'field_visibility', 'source', 'claimed_at'] as $field) {
                if ($field === 'phone_whatsapp' && ! $includeContact) {
                    continue;
                }
                $value = $profile->getAttribute($field);
                $data[$field] = $value instanceof \BackedEnum ? $value->value : $value;
            }
        }

        if ($viewer->isAdmin() && ! $owner && $includeContact && $profile->phone_whatsapp !== null) {
            AuditLog::create(['actor_id' => $viewer->id, 'action' => 'contact.viewed', 'subject_type' => 'alumni_profile', 'subject_id' => $profile->id, 'meta' => ['purpose' => 'administration']]);
        }

        return $data;
    }

    /** @return array<string, mixed> */
    public function summary(AlumniProfile $profile, User $viewer): array
    {
        Gate::forUser($viewer)->authorize('viewAny', AlumniProfile::class);

        return array_intersect_key($this->profile($profile, $viewer, false), array_flip(['id', 'full_name', 'gender', 'entry_year', 'leave_year', 'angkatan', 'pondok', 'program', 'alumni_status', 'province', 'regency', 'activity_status', 'profession', 'organization', 'field', 'verification_status', 'verified_at', 'map_mode', 'directory_visible', 'source', 'claimed_at'])) + ['created_at' => $profile->created_at?->toISOString()];
    }

    /** @return array<string, mixed> */
    public function contact(ContactRequest $contact, User $viewer): array
    {
        $own = $viewer->alumniProfile;
        abort_unless($own && in_array($own->id, [$contact->requester_profile_id, $contact->target_profile_id], true), 403);
        $otherId = $contact->requester_profile_id === $own->id ? $contact->target_profile_id : $contact->requester_profile_id;
        $other = AlumniProfile::find($otherId);
        $data = ['id' => $contact->id, 'incoming' => $contact->target_profile_id === $own->id, 'message' => $contact->message, 'status' => $contact->status->value, 'created_at' => $contact->created_at?->toISOString(), 'other' => null];
        if ($other && $viewer->can('view', $other)) {
            $data['other'] = $this->profile($other, $viewer);
        }

        return $data;
    }

    /** @return array<string, mixed> */
    public function export(User $user): array
    {
        $profile = $user->alumniProfile()->withTrashed()->first();
        $contacts = $profile ? ContactRequest::where(fn ($query) => $query->where('requester_profile_id', $profile->id)->orWhere('target_profile_id', $profile->id))->get()->map(fn (ContactRequest $contact): array => ['id' => $contact->id, 'direction' => $contact->requester_profile_id === $profile->id ? 'outgoing' : 'incoming', 'message' => $contact->message, 'status' => $contact->status->value, 'responded_at' => $contact->responded_at, 'expires_at' => $contact->expires_at, 'created_at' => $contact->created_at])->all() : [];

        return ['account' => $user->only(['name', 'email', 'email_verified_at', 'created_at']), 'profile' => $profile ? $this->profile($profile, $user) : null, 'consents' => ConsentRecord::where('user_id', $user->id)->get(['type', 'version', 'granted', 'recorded_at'])->toArray(), 'contact_requests' => $contacts];
    }

    /** @return array{phone_whatsapp: string|null, email: string|null} */
    public function approvedContact(ContactRequest $contact, User $viewer): array
    {
        abort_unless($contact->requester_profile_id === $viewer->alumniProfile?->id && $contact->status === ContactRequestStatus::Approved && $viewer->alumniProfile->verification_status === VerificationStatus::Approved, 403);
        $target = $this->discoverable()->with('user')->findOrFail($contact->target_profile_id);
        AuditLog::create(['actor_id' => $viewer->id, 'action' => 'contact.viewed', 'subject_type' => 'contact_request', 'subject_id' => $contact->id]);

        return ['phone_whatsapp' => $target->phone_whatsapp, 'email' => $target->user?->email];
    }
}
