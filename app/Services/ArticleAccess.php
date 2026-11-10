<?php

namespace App\Services;

use App\AdminRole;
use App\Models\User;

class ArticleAccess
{
    public function canPublish(User $user): bool
    {
        return $user->isAdmin() || $this->holds($user, AdminRole::Editor);
    }

    public function canWrite(User $user): bool
    {
        return $this->canPublish($user) || $this->holds($user, AdminRole::Author);
    }

    private function holds(User $user, AdminRole $role): bool
    {
        return $user->canAccessAdminPanel() && $user->hasRole($role->value);
    }
}
