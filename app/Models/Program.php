<?php

namespace App\Models;

use Database\Factories\ProgramFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'requires_hafalan', 'sort_order', 'is_active'])]
class Program extends Model
{
    /** @use HasFactory<ProgramFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['requires_hafalan' => 'boolean', 'is_active' => 'boolean', 'sort_order' => 'integer'];
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
}
