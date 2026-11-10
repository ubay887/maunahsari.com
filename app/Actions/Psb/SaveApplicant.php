<?php

namespace App\Actions\Psb;

use App\ApplicantStatus;
use App\Models\Applicant;
use App\Pondok;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveApplicant
{
    public function __construct(private QuotaLock $lock) {}

    /** @param array<string, mixed> $data */
    public function handle(Applicant $applicant, array $data): Applicant
    {
        return DB::transaction(function () use ($applicant, $data): Applicant {
            $this->lock->period($applicant->registration_period_id);
            $locked = Applicant::query()->lockForUpdate()->findOrFail($applicant->id);
            if ((int) $data['registration_period_id'] !== $locked->registration_period_id || (string) $data['gender'] !== $locked->gender) {
                throw ValidationException::withMessages(['registration_period_id' => 'Periode dan jenis kelamin tidak dapat diubah setelah nomor registrasi diterbitkan.']);
            }
            if ((int) $data['program_id'] !== $locked->program_id && in_array($locked->status, ApplicantStatus::occupying(), true)) {
                $this->lock->available($locked->registration_period_id, (int) $data['program_id'], Pondok::fromGender($locked->gender));
            }
            $locked->fill(Arr::only($data, SubmitApplication::BIODATA))->save();
            $locked->santri()->update($locked->only(SubmitApplication::SANTRI_FIELDS));

            return $locked;
        });
    }
}
