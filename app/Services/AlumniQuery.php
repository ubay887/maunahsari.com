<?php

namespace App\Services;

use App\Models\AlumniProfile;
use Illuminate\Database\Eloquent\Builder;

class AlumniQuery
{
    /**
     * @param  Builder<AlumniProfile>  $query
     * @param  array<string, mixed>  $filters
     * @return Builder<AlumniProfile>
     */
    public function apply(Builder $query, array $filters, bool $member = false): Builder
    {
        foreach (['angkatan', 'verification_status', 'pondok', 'province_id', 'regency_id', 'source', 'profession', 'program_id'] as $field) {
            if (isset($filters[$field]) && $filters[$field] !== '') {
                $query->where($field, $filters[$field]);
                if ($member && in_array($field, ['profession', 'angkatan', 'pondok'], true)) {
                    $this->fieldVisible($query, $field);
                }
            }
        }
        if (! empty($filters['search'])) {
            $term = '%'.$filters['search'].'%';
            if ($member) {
                $query->where(fn (Builder $scope) => $scope
                    ->where(fn (Builder $name) => $this->fieldVisible($name->where('full_name', 'like', $term), 'full_name'))
                    ->orWhere(fn (Builder $nickname) => $this->fieldVisible($nickname->where('nickname', 'like', $term), 'nickname')));
            } else {
                $query->where(fn (Builder $scope) => $scope->where('full_name', 'like', $term)->orWhere('nickname', 'like', $term));
            }
        }
        if (! empty($filters['open_to'])) {
            $query->whereJsonContains('open_to', $filters['open_to']);
            if ($member) {
                $this->fieldVisible($query, 'open_to');
            }
        }

        return $query;
    }

    /** @param Builder<AlumniProfile> $query */
    private function fieldVisible(Builder $query, string $field): void
    {
        $query->where(fn (Builder $scope) => $scope->where('field_visibility->'.$field, 'alumni')->orWhere('field_visibility->'.$field, 'public'));
    }
}
