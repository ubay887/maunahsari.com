<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\RegistrationPeriodFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property CarbonImmutable $opens_at
 * @property CarbonImmutable|null $closes_at
 */
#[Fillable(['name', 'academic_year', 'is_open', 'opens_at', 'closes_at', 'fee_url_putra', 'fee_url_putri', 'contact_whatsapp_putra', 'contact_whatsapp_putri', 'info_note'])]
class RegistrationPeriod extends Model
{
    /** @use HasFactory<RegistrationPeriodFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['is_open' => 'boolean', 'opens_at' => 'immutable_datetime', 'closes_at' => 'immutable_datetime'];
    }

    /** @return HasMany<ProgramQuota, $this> */
    public function quotas(): HasMany
    {
        return $this->hasMany(ProgramQuota::class);
    }

    /** @return HasMany<Applicant, $this> */
    public function applicants(): HasMany
    {
        return $this->hasMany(Applicant::class);
    }

    public function isCurrentlyOpen(): bool
    {
        return $this->is_open && $this->opens_at->lessThanOrEqualTo(now()) && ($this->closes_at === null || $this->closes_at->greaterThan(now()));
    }
}
