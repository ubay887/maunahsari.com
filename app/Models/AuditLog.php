<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['actor_id', 'action', 'subject_type', 'subject_id', 'meta'])]
class AuditLog extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['meta' => 'array'];
    }
}
