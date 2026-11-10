<?php

namespace App\Services;

use App\Http\Requests\ApplicantIndexRequest;
use App\Models\Applicant;
use Illuminate\Database\Eloquent\Builder;

class ApplicantQuery
{
    /** @return Builder<Applicant> */
    public function filtered(ApplicantIndexRequest $request): Builder
    {
        $query = Applicant::query()->with(['program:id,name', 'registrationPeriod:id,name']);
        foreach (['registration_period_id', 'program_id', 'pondok', 'status', 'residence_type', 'source'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->string($field)->toString());
            }
        }
        if ($request->filled('search')) {
            $term = '%'.$request->string('search')->toString().'%';
            $phone = '%'.PsbPhone::normalize($request->string('search')->toString()).'%';
            $query->where(fn (Builder $search): Builder => $search->whereLike('full_name', $term)->orWhereLike('registration_number', $term)->orWhereLike('guardian_phone', $phone));
        }

        return $query->orderBy($request->string('sort', 'created_at')->toString() ?: 'created_at', $request->input('direction') === 'asc' ? 'asc' : 'desc')->orderByDesc('id');
    }
}
