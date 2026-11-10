<?php

namespace App\Policies;

use App\Models\RegistrationPeriod;
use App\Models\User;

class RegistrationPeriodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, RegistrationPeriod $record): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, RegistrationPeriod $record): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, RegistrationPeriod $record): bool
    {
        return $user->isAdmin();
    }
}
