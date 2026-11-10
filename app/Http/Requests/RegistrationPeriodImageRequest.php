<?php

namespace App\Http\Requests;

use App\Models\RegistrationPeriod;

class RegistrationPeriodImageRequest extends ArticleImageRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', RegistrationPeriod::class) ?? false;
    }
}
