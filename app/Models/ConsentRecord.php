<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'profile_id', 'type', 'version', 'granted', 'recorded_at'])]
class ConsentRecord extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['granted' => 'boolean', 'recorded_at' => 'immutable_datetime'];
    }
}
