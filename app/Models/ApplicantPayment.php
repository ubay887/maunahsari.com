<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\ApplicantPaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property CarbonImmutable $paid_at
 */
#[Fillable(['applicant_id', 'amount', 'paid_at', 'note', 'recorded_by'])]
class ApplicantPayment extends Model
{
    /** @use HasFactory<ApplicantPaymentFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['amount' => 'integer', 'paid_at' => 'immutable_datetime'];
    }

    /** @return BelongsTo<Applicant, $this> */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
