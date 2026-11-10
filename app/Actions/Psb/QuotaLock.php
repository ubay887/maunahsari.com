<?php

namespace App\Actions\Psb;

use App\Models\ProgramQuota;
use App\Models\RegistrationPeriod;
use App\Pondok;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuotaLock
{
    public const CLOSED_MESSAGE = 'Kuota habis, pendaftaran ditutup.';

    /** Acquire the SQLite write lock before any availability read. Call only inside a transaction. */
    public function period(int $periodId): RegistrationPeriod
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::table('registration_periods')->where('id', $periodId)->update(['is_open' => DB::raw('is_open')]);
        }

        return RegistrationPeriod::query()->lockForUpdate()->findOrFail($periodId);
    }

    public function available(int $periodId, int $programId, Pondok $pondok): ProgramQuota
    {
        $quota = ProgramQuota::query()->where('registration_period_id', $periodId)->where('program_id', $programId)->where('pondok', $pondok)->lockForUpdate()->first();
        if ($quota === null || ! $quota->isAvailable()) {
            throw ValidationException::withMessages(['program_id' => self::CLOSED_MESSAGE]);
        }

        return $quota;
    }
}
