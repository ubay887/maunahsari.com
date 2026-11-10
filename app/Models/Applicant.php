<?php

namespace App\Models;

use App\ApplicantSource;
use App\ApplicantStatus;
use App\Pondok;
use App\ResidenceType;
use Carbon\CarbonImmutable;
use Database\Factories\ApplicantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

/**
 * @property-read RegistrationPeriod $registrationPeriod
 * @property-read Program $program
 * @property int|null $user_id
 * @property string|null $nik
 * @property string|null $province_code
 * @property string|null $city_code
 * @property string|null $district_code
 * @property string|null $village_code
 * @property string|null $rt
 * @property string|null $rw
 * @property string|null $postal_code
 * @property ApplicantStatus $status
 * @property Pondok $pondok
 * @property ResidenceType $residence_type
 * @property ApplicantSource $source
 * @property CarbonImmutable $birth_date
 * @property CarbonImmutable|null $agreed_at
 * @property CarbonImmutable|null $visit_scheduled_at
 * @property CarbonImmutable|null $visited_at
 * @property CarbonImmutable|null $sowan_done_at
 * @property CarbonImmutable|null $decided_at
 */
#[Fillable(['user_id', 'registration_number', 'registration_period_id', 'program_id', 'pondok', 'residence_type', 'source', 'status', 'nik', 'province_code', 'city_code', 'district_code', 'village_code', 'rt', 'rw', 'postal_code', 'full_name', 'nickname', 'gender', 'birth_place', 'birth_date', 'address', 'last_education', 'hafalan_juz', 'can_read_binnadhor', 'can_write_pegon', 'guardian_name', 'guardian_relation', 'guardian_phone', 'agreed_to_rules', 'agreed_at', 'visit_scheduled_at', 'visited_at', 'sowan_done_at', 'admin_note', 'decision_reason', 'decided_at', 'decided_by'])]
class Applicant extends Model
{
    /** @use HasFactory<ApplicantFactory> */
    use HasFactory, SoftDeletes;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['pondok' => Pondok::class, 'residence_type' => ResidenceType::class, 'source' => ApplicantSource::class, 'status' => ApplicantStatus::class, 'birth_date' => 'immutable_date', 'hafalan_juz' => 'integer', 'can_read_binnadhor' => 'boolean', 'can_write_pegon' => 'boolean', 'agreed_to_rules' => 'boolean', 'agreed_at' => 'immutable_datetime', 'visit_scheduled_at' => 'immutable_datetime', 'visited_at' => 'immutable_datetime', 'sowan_done_at' => 'immutable_datetime', 'decided_at' => 'immutable_datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<RegistrationPeriod, $this> */
    public function registrationPeriod(): BelongsTo
    {
        return $this->belongsTo(RegistrationPeriod::class);
    }

    /** @return BelongsTo<Province, $this> */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_code', 'code');
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_code', 'code');
    }

    /** @return BelongsTo<District, $this> */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_code', 'code');
    }

    /** @return BelongsTo<Village, $this> */
    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_code', 'code');
    }

    /** @return BelongsTo<Program, $this> */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /** @return HasMany<ApplicantDocument, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(ApplicantDocument::class);
    }

    /** @return HasMany<ApplicantPayment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(ApplicantPayment::class);
    }

    /** @return HasMany<ApplicantStatusHistory, $this> */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(ApplicantStatusHistory::class);
    }

    /** @return HasOne<Santri, $this> */
    public function santri(): HasOne
    {
        return $this->hasOne(Santri::class);
    }
}
