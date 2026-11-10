<?php

namespace App\Models;

use App\ApplicantStatus;
use App\Pondok;
use Database\Factories\ProgramQuotaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read RegistrationPeriod $registrationPeriod
 * @property-read Program $program
 * @property Pondok $pondok
 */
#[Fillable(['registration_period_id', 'program_id', 'pondok', 'capacity', 'is_open'])]
class ProgramQuota extends Model
{
    /** @use HasFactory<ProgramQuotaFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['pondok' => Pondok::class, 'capacity' => 'integer', 'is_open' => 'boolean'];
    }

    /** @return BelongsTo<RegistrationPeriod, $this> */
    public function registrationPeriod(): BelongsTo
    {
        return $this->belongsTo(RegistrationPeriod::class);
    }

    /** @return BelongsTo<Program, $this> */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function usedCount(): int
    {
        return Applicant::query()->where('registration_period_id', $this->registration_period_id)->where('program_id', $this->program_id)->where('pondok', $this->pondok)->whereIn('status', ApplicantStatus::occupying())->count();
    }

    public function remaining(): int
    {
        return max(0, $this->capacity - $this->usedCount());
    }

    public function isAvailable(): bool
    {
        return $this->is_open && $this->registrationPeriod->isCurrentlyOpen() && $this->program->is_active && $this->remaining() > 0;
    }
}
