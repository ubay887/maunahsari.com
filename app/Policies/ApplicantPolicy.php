<?php

namespace App\Policies;

use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\User;
use App\UserRole;

class ApplicantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Applicant $record): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Applicant $record): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Applicant $record): bool
    {
        return $user->isAdmin();
    }

    /** Calon santri hanya melihat pendaftaran miliknya sendiri. */
    public function viewOwn(User $user, Applicant $record): bool
    {
        return $user->role === UserRole::Applicant && $record->user_id === $user->id;
    }

    /** Data dan berkas hanya dapat diubah pemiliknya selama pendaftaran belum diverifikasi. */
    public function updateOwn(User $user, Applicant $record): bool
    {
        return $this->viewOwn($user, $record) && $record->status === ApplicantStatus::Registered;
    }
}
