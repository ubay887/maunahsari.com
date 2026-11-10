<?php

namespace App\Models;

use App\Pondok;
use App\ResidenceType;
use Carbon\CarbonImmutable;
use Database\Factories\SantriFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

/**
 * @property string|null $nik
 * @property string|null $province_code
 * @property string|null $city_code
 * @property string|null $district_code
 * @property string|null $village_code
 * @property string|null $rt
 * @property string|null $rw
 * @property string|null $postal_code
 * @property Pondok $pondok
 * @property ResidenceType $residence_type
 * @property CarbonImmutable $birth_date
 */
#[Fillable(['applicant_id', 'nik', 'province_code', 'city_code', 'district_code', 'village_code', 'rt', 'rw', 'postal_code', 'full_name', 'nickname', 'gender', 'pondok', 'residence_type', 'program_id', 'birth_place', 'birth_date', 'address', 'guardian_name', 'guardian_phone', 'photo_path', 'entry_year', 'is_active'])]
class Santri extends Model
{
    /** @use HasFactory<SantriFactory> */
    use HasFactory;

    protected $table = 'santris';

    /** @var list<string> */
    protected $hidden = ['photo_path'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['pondok' => Pondok::class, 'residence_type' => ResidenceType::class, 'birth_date' => 'immutable_date', 'entry_year' => 'integer', 'is_active' => 'boolean'];
    }

    /** @return BelongsTo<Applicant, $this> */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
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
}
