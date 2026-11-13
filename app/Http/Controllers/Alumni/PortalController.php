<?php

namespace App\Http\Controllers\Alumni;

use App\ContactRequestStatus;
use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use App\Models\User;
use App\Services\AlumniPrivacy;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    /** Isian profil yang dihitung dalam kelengkapan, berurutan dari yang paling berpengaruh. */
    private const COMPLETENESS_FIELDS = ['full_name', 'gender', 'entry_year', 'regency', 'profession', 'bio', 'skills', 'photo', 'phone_whatsapp'];

    public function index(#[CurrentUser] User $user, AlumniPrivacy $privacy): Response
    {
        $profile = $user->alumniProfile;

        $data = $profile ? $privacy->profile($profile, $user) : null;

        return Inertia::render('alumni/home', [
            'status' => $data['verification_status'] ?? null,
            'rejectionReason' => $data['rejection_reason'] ?? null,
            'needsPrivacy' => $data !== null && (($data['map_mode'] ?? null) === null || ($data['directory_visible'] ?? null) === null),
            'profile' => $data === null ? null : [
                'full_name' => $data['full_name'] ?? $user->name,
                'photo' => $data['photo'] ?? null,
                'angkatan' => $data['angkatan'] ?? null,
                'regency' => $data['regency'] ?? null,
                'profession' => $data['profession'] ?? null,
            ],
            'completeness' => $data === null ? null : $this->completeness($data),
            'stats' => $profile !== null && $user->can('browse-alumni') ? [
                'pendingRequests' => ContactRequest::query()
                    ->where('target_profile_id', $profile->id)
                    ->where('status', ContactRequestStatus::Pending)
                    ->where('expires_at', '>', now())
                    ->count(),
                'alumniTotal' => $privacy->discoverable()->count(),
            ] : null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{percent: int, missing: list<string>}
     */
    private function completeness(array $data): array
    {
        $missing = array_values(array_filter(
            self::COMPLETENESS_FIELDS,
            fn (string $field): bool => in_array($data[$field] ?? null, [null, '', []], true),
        ));

        return [
            'percent' => (int) round((count(self::COMPLETENESS_FIELDS) - count($missing)) / count(self::COMPLETENESS_FIELDS) * 100),
            'missing' => $missing,
        ];
    }
}
