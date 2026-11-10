<?php

namespace App\Policies;

use App\Models\ApplicantDocument;
use App\Models\User;
use App\UserRole;

class ApplicantDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, ApplicantDocument $record): bool
    {
        return $user->isAdmin() || ($user->role === UserRole::Applicant && $record->applicant?->user_id === $user->id);
    }

    public function update(User $user, ApplicantDocument $record): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, ApplicantDocument $record): bool
    {
        return $user->isAdmin();
    }
}
