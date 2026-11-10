<?php

namespace App\Services;

use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\Program;
use App\Models\ProgramQuota;
use App\Models\RegistrationPeriod;

class PsbData
{
    public function __construct(private PsbFormData $formData) {}

    public function activePeriod(): ?RegistrationPeriod
    {
        return RegistrationPeriod::where('is_open', true)->where('opens_at', '<=', now())->where(fn ($query) => $query->whereNull('closes_at')->orWhere('closes_at', '>', now()))->latest('opens_at')->latest('id')->first();
    }

    /** @return list<array<string, mixed>> */
    public function quotas(?int $periodId): array
    {
        if ($periodId === null) {
            return [];
        }
        $used = Applicant::query()->selectRaw('program_id, pondok, COUNT(*) AS total')->where('registration_period_id', $periodId)->whereIn('status', ApplicantStatus::occupying())->groupBy('program_id', 'pondok')->get();
        $counts = [];
        foreach ($used as $row) {
            $counts[$row->program_id.'-'.$row->pondok->value] = (int) $row->getAttribute('total');
        }

        return array_values(ProgramQuota::with(['program', 'registrationPeriod'])->where('registration_period_id', $periodId)->orderBy('program_id')->orderBy('pondok')->get()->map(function (ProgramQuota $quota) use ($counts): array {
            $usedCount = $counts[$quota->program_id.'-'.$quota->pondok->value] ?? 0;

            return [...$quota->toArray(), 'used' => $usedCount, 'remaining' => max(0, $quota->capacity - $usedCount), 'available' => $quota->is_open && $quota->registrationPeriod->isCurrentlyOpen() && $quota->program->is_active && $usedCount < $quota->capacity];
        })->all());
    }

    /** @return array<string, mixed> */
    public function formProps(?Applicant $applicant = null): array
    {
        return ['periods' => RegistrationPeriod::orderByDesc('id')->get(), 'programs' => Program::orderBy('sort_order')->orderBy('id')->get(), ...$this->formData->options($applicant)];
    }
}
