<?php

namespace App\Actions\Users;

use App\AdminRole;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChangeStaffRole
{
    public function handle(User $user, AdminRole $role, User $actor): void
    {
        DB::transaction(function () use ($user, $role, $actor): void {
            $from = $user->getRoleNames()->first();
            $user->assignStaffRole($role);
            AuditLog::create(['actor_id' => $actor->id, 'action' => 'user.role_changed', 'subject_type' => 'user', 'subject_id' => $user->id, 'meta' => ['from' => $from, 'to' => $role->value]]);
        });
    }
}
