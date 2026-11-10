<?php

namespace App\Policies;

use App\Models\ProgramQuota;
use App\Models\User;

class ProgramQuotaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, ProgramQuota $record): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, ProgramQuota $record): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, ProgramQuota $record): bool
    {
        return $user->isAdmin();
    }
}
