<?php

namespace Database\Seeders;

use App\ImportStatus;
use App\Models\AlumniImportBatch;
use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\ConsentRecord;
use App\Models\User;
use App\VerificationStatus;
use Database\Seeders\Concerns\DeterministicData;
use Illuminate\Database\Seeder;

/**
 * Jejak audit yang sesuai dengan data alumni yang ada: keputusan verifikasi, impor, kode klaim,
 * ekspor, akses kontak oleh admin, dan unduhan data oleh alumni. Dibuat setelah seeder alumni.
 * Hanya berjalan di local/testing.
 */
class AuditLogSeeder extends Seeder
{
    use DeterministicData;

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $admin = User::where('email', 'alumni-admin@example.test')->first();
        if ($admin === null) {
            return;
        }

        AlumniProfile::query()->whereIn('verification_status', [VerificationStatus::Approved, VerificationStatus::Rejected])->whereNotNull('verified_at')->orderBy('id')->each(function (AlumniProfile $profile): void {
            $this->log($profile->verified_by, 'profile.'.$profile->verification_status->value, 'alumni_profile', $profile->id, null, $profile->verified_at);
        });

        AlumniImportBatch::query()->whereIn('status', [ImportStatus::Completed, ImportStatus::Failed])->orderBy('id')->each(function (AlumniImportBatch $batch): void {
            if ($batch->status === ImportStatus::Completed) {
                $this->log($batch->imported_by, 'alumni.imported', 'alumni_import_batch', $batch->id, ['created' => $batch->created_count, 'failed' => $batch->failed_count], $batch->updated_at);
            }
        });

        AlumniProfile::query()->where('source', 'import')->orderBy('id')->get()->each(function (AlumniProfile $profile, int $index) use ($admin): void {
            if ($index % 2 === 0) {
                $this->log($admin->id, 'claim.generated', 'alumni_profile', $profile->id, null, now()->subDays(12 + $index % 9)->setTime(10, $index % 60));
            }
        });

        $approved = AlumniProfile::query()->where('verification_status', VerificationStatus::Approved)->whereNotNull('phone_whatsapp')->orderBy('id')->limit(40)->pluck('id')->all();
        foreach ([3, 9, 14, 22, 31, 36] as $n => $at) {
            $this->log($admin->id, 'contact.viewed', 'alumni_profile', $approved[$at % max(count($approved), 1)] ?? null, ['purpose' => 'administration'], now()->subDays(2 + $n * 3)->setTime(9 + $n, 20));
        }
        foreach ([['alumni.exported', 'alumni_profile', 40], ['alumni.exported', 'alumni_profile', 11], ['claims.exported', 'alumni_profile', 12]] as $n => [$action, $subject, $days]) {
            $this->log($admin->id, $action, $subject, null, null, now()->subDays($days)->setTime(14, 5 + $n));
        }

        ConsentRecord::query()->whereNotNull('user_id')->where('type', 'privacy_policy')->orderBy('id')->limit(30)->pluck('user_id')->unique()->values()->each(function (int $userId, int $index): void {
            if ($index % 6 === 0) {
                $this->log($userId, 'data.exported', 'own_account', null, null, now()->subDays(4 + $index)->setTime(20, 10));
            }
        });
    }

    /** @param array<string, mixed>|null $meta */
    private function log(?int $actorId, string $action, string $subjectType, ?int $subjectId, ?array $meta, mixed $at): void
    {
        $log = AuditLog::firstOrCreate(['actor_id' => $actorId, 'action' => $action, 'subject_type' => $subjectType, 'subject_id' => $subjectId], ['meta' => $meta]);
        if ($at !== null) {
            AuditLog::unguarded(fn () => $log->forceFill(['created_at' => $at, 'updated_at' => $at])->save());
        }
    }
}
