<?php

namespace App\Actions\Psb;

use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChangeApplicantStatus
{
    public function __construct(private QuotaLock $lock, private AcceptApplicant $accept) {}

    public function handle(Applicant $applicant, ApplicantStatus $status, User $actor, ?string $reason = null): Applicant
    {
        if ($status === ApplicantStatus::Accepted) {
            $this->accept->handle($applicant, $actor);

            return $applicant->refresh();
        }

        return DB::transaction(function () use ($applicant, $status, $actor, $reason): Applicant {
            $this->lock->period($applicant->registration_period_id);
            $locked = Applicant::query()->lockForUpdate()->findOrFail($applicant->id);
            $from = $locked->status;
            if ($from === $status) {
                return $locked;
            }
            $allowed = $status === ApplicantStatus::Cancelled
                || ($from === ApplicantStatus::Registered && $status === ApplicantStatus::Verified)
                || (in_array($from, [ApplicantStatus::Registered, ApplicantStatus::Verified], true) && $status === ApplicantStatus::Rejected)
                || (in_array($from, [ApplicantStatus::Rejected, ApplicantStatus::Cancelled], true) && $status === ApplicantStatus::Registered);
            if (! $allowed) {
                throw ValidationException::withMessages(['status' => 'Transisi status tidak diperbolehkan.']);
            }
            if ($status === ApplicantStatus::Rejected && trim($reason ?? '') === '') {
                throw ValidationException::withMessages(['decision_reason' => 'Alasan penolakan wajib diisi.']);
            }
            if ($status === ApplicantStatus::Registered) {
                $this->lock->available($locked->registration_period_id, $locked->program_id, $locked->pondok);
            }
            $locked->statusHistories()->create(['from_status' => $from, 'to_status' => $status, 'reason' => $reason, 'changed_by' => $actor->id]);
            $isDecision = in_array($status, [ApplicantStatus::Rejected, ApplicantStatus::Cancelled], true);
            $locked->update(['status' => $status, 'decision_reason' => $isDecision ? $reason : null, 'decided_at' => $isDecision ? now() : null, 'decided_by' => $isDecision ? $actor->id : null]);
            if ($isDecision) {
                $locked->santri()->update(['is_active' => false]);
            }

            return $locked;
        });
    }
}
