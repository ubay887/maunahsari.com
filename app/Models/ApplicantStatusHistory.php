<?php

namespace App\Models;

use App\ApplicantStatus;
use Database\Factories\ApplicantStatusHistoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property ApplicantStatus|null $from_status
 * @property ApplicantStatus $to_status
 */
#[Fillable(['applicant_id', 'from_status', 'to_status', 'reason', 'changed_by'])]
class ApplicantStatusHistory extends Model
{
    /** @use HasFactory<ApplicantStatusHistoryFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['from_status' => ApplicantStatus::class, 'to_status' => ApplicantStatus::class];
    }

    /** @return BelongsTo<Applicant, $this> */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    /** @return BelongsTo<User, $this> */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
