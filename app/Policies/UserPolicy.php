<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Admin mengubah peran staf lain; akun sendiri diatur lewat pengaturan akun. */
    public function update(User $user, User $target): bool
    {
        return $user->isAdmin() && $target->canAccessAdminPanel() && $user->isNot($target);
    }

    public function resetPassword(User $user, User $target): bool
    {
        return $user->isAdmin() && $user->isNot($target);
    }

    public function delete(User $user, User $target): bool
    {
        return $user->isAdmin() && $user->isNot($target);
    }
}
