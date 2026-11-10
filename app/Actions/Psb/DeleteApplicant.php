<?php

namespace App\Actions\Psb;

use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteApplicant
{
    public function __construct(private ChangeApplicantStatus $changeStatus) {}

    public function handle(Applicant $applicant, User $actor): void
    {
        DB::transaction(function () use ($applicant, $actor): void {
            $locked = $this->changeStatus->handle($applicant, ApplicantStatus::Cancelled, $actor, 'Pendaftar dihapus oleh admin.');
            $locked->delete();
        });
    }
}
