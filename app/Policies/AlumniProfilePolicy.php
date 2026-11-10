<?php

namespace App\Policies;

use App\MapMode;
use App\Models\AlumniProfile;
use App\Models\User;
use App\UserRole;
use App\VerificationStatus;

class AlumniProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || ($user->role === UserRole::Alumni && $user->hasVerifiedEmail());
    }

    public function update(User $user, AlumniProfile $profile): bool
    {
        return $user->isAdmin() || ($user->role === UserRole::Alumni && $profile->user_id === $user->id);
    }

    public function view(User $user, AlumniProfile $profile): bool
    {
        return $this->update($user, $profile) || ($user->can('browse-alumni') && $profile->verification_status === VerificationStatus::Approved && $profile->map_mode === MapMode::Visible && $profile->directory_visible === true);
    }

    public function delete(User $user, AlumniProfile $profile): bool
    {
        return $this->update($user, $profile);
    }
}
