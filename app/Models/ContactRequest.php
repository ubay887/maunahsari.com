<?php

namespace App\Models;

use App\ContactRequestStatus;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property ContactRequestStatus $status
 * @property CarbonImmutable|null $expires_at
 */
#[Fillable(['requester_profile_id', 'target_profile_id', 'message', 'status', 'responded_at', 'expires_at'])]
class ContactRequest extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['status' => ContactRequestStatus::class, 'responded_at' => 'immutable_datetime', 'expires_at' => 'immutable_datetime'];
    }
}
