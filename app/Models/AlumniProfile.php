<?php

namespace App\Models;

use App\AlumniStatus;
use App\MapMode;
use App\Pondok;
use App\VerificationStatus;
use Database\Factories\AlumniProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property AlumniStatus $alumni_status
 * @property VerificationStatus $verification_status
 * @property MapMode|null $map_mode
 * @property Pondok $pondok
 * @property array<string, string>|null $field_visibility
 * @property list<string>|null $skills
 * @property list<string>|null $open_to
 * @property array<string, string>|null $social_links
 */
#[Fillable(['user_id', 'santri_id', 'full_name', 'nickname', 'gender', 'birth_place', 'birth_date', 'photo_path', 'phone_whatsapp', 'entry_year', 'leave_year', 'pondok', 'program_id', 'alumni_status', 'angkatan', 'province_id', 'regency_id', 'profession', 'organization', 'field', 'skills', 'bio', 'social_links', 'open_to', 'verification_status', 'verified_at', 'verified_by', 'rejection_reason', 'map_mode', 'directory_visible', 'field_visibility', 'source'])]
#[Hidden(['photo_path', 'phone_whatsapp'])]
class AlumniProfile extends Model
{
    /** @use HasFactory<AlumniProfileFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (AlumniProfile $profile): void {
            if ($profile->gender !== null && $profile->gender !== '') {
                $profile->pondok = Pondok::fromGender($profile->gender);
            }
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['birth_date' => 'immutable_date:Y-m-d', 'entry_year' => 'integer', 'leave_year' => 'integer', 'pondok' => Pondok::class, 'alumni_status' => AlumniStatus::class, 'verification_status' => VerificationStatus::class, 'map_mode' => MapMode::class, 'directory_visible' => 'boolean', 'field_visibility' => 'array', 'skills' => 'array', 'social_links' => 'array', 'open_to' => 'array', 'verified_at' => 'immutable_datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /** @return BelongsTo<Province, $this> */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    /** @return BelongsTo<Regency, $this> */
    public function regency(): BelongsTo
    {
        return $this->belongsTo(Regency::class);
    }

    /** @return BelongsTo<Santri, $this> */
    public function santri(): BelongsTo
    {
        return $this->belongsTo(Santri::class);
    }

    /** @return BelongsTo<Program, $this> */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
