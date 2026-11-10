<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\AlumniClaimCodes;
use App\Services\AlumniPrivacy;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AlumniClaimCodeController extends Controller
{
    public function store(AlumniProfile $profile, #[CurrentUser] User $admin, AlumniClaimCodes $codes): JsonResponse
    {
        Gate::authorize('update', $profile);
        $code = $codes->issue($profile, $admin);
        abort_if($code === null, 422);

        return response()->json(['code' => $code])->header('Cache-Control', 'private, no-store');
    }

    public function export(#[CurrentUser] User $admin, AlumniClaimCodes $codes, AlumniPrivacy $privacy): StreamedResponse
    {
        Gate::authorize('viewAny', AlumniProfile::class);
        AuditLog::create(['actor_id' => $admin->id, 'action' => 'claims.exported', 'subject_type' => 'alumni_profile']);

        return response()->streamDownload(function () use ($admin, $codes, $privacy): void {
            $file = fopen('php://output', 'w');
            if ($file === false) {
                return;
            } fputcsv($file, ['profile_id', 'full_name', 'angkatan', 'claim_code'], escape: '');
            foreach (AlumniProfile::where('source', 'import')->whereNull('user_id')->whereNull('claimed_at')->lazyById(100) as $profile) {
                $code = $codes->issue($profile, $admin);
                if ($code === null) {
                    continue;
                }
                $data = $privacy->profile($profile, $admin);
                $name = (string) $data['full_name'];
                if (preg_match('/^[\x00-\x20]*[=+@\-]/', $name)) {
                    $name = "'".$name;
                }
                fputcsv($file, [$profile->id, $name, $data['angkatan'], $code], escape: '');
            }
            fclose($file);
        }, 'kode-klaim-alumni.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'private, no-store']);
    }
}
