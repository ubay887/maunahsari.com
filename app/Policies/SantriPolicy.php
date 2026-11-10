<?php

namespace App\Policies;

use App\Models\Santri;
use App\Models\User;

class SantriPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Santri $record): bool
    {
        return $user->isAdmin();
    }
}
