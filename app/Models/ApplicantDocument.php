<?php

namespace App\Models;

use App\DocumentType;
use Carbon\CarbonImmutable;
use Database\Factories\ApplicantDocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property DocumentType $type
 * @property CarbonImmutable|null $verified_at
 */
#[Fillable(['applicant_id', 'type', 'path', 'original_name', 'size', 'mime', 'is_verified', 'verified_at', 'verified_by'])]
class ApplicantDocument extends Model
{
    /** @use HasFactory<ApplicantDocumentFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $hidden = ['path'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['type' => DocumentType::class, 'size' => 'integer', 'is_verified' => 'boolean', 'verified_at' => 'immutable_datetime'];
    }

    /** @return BelongsTo<Applicant, $this> */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
