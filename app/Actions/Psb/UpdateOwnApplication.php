<?php

namespace App\Actions\Psb;

use App\ApplicantStatus;
use App\Models\Applicant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Perubahan biodata oleh calon santri sendiri; terkunci begitu admin memverifikasi pendaftaran. */
class UpdateOwnApplication
{
    public function __construct(private QuotaLock $lock, private SaveApplicant $save) {}

    /** @param array<string, mixed> $data */
    public function handle(Applicant $applicant, array $data): Applicant
    {
        return DB::transaction(function () use ($applicant, $data): Applicant {
            $this->lock->period($applicant->registration_period_id);
            $locked = Applicant::query()->lockForUpdate()->findOrFail($applicant->id);
            if ($locked->status !== ApplicantStatus::Registered) {
                throw ValidationException::withMessages(['status' => 'Data terkunci karena pendaftaran sudah diproses. Hubungi narahubung untuk perubahan.']);
            }

            return $this->save->handle($locked, $data);
        });
    }
}
