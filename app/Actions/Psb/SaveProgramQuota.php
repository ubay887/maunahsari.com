<?php

namespace App\Actions\Psb;

use App\Models\ProgramQuota;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveProgramQuota
{
    public function __construct(private QuotaLock $lock) {}

    /** @param array<string, mixed> $data */
    public function handle(array $data): ProgramQuota
    {
        return DB::transaction(function () use ($data): ProgramQuota {
            $this->lock->period((int) $data['registration_period_id']);
            $quota = ProgramQuota::query()->where('registration_period_id', $data['registration_period_id'])->where('program_id', $data['program_id'])->where('pondok', $data['pondok'])->lockForUpdate()->firstOrNew();
            if ($quota->exists && (int) $data['capacity'] < $quota->usedCount()) {
                throw ValidationException::withMessages(['capacity' => 'Kapasitas tidak boleh kurang dari jumlah terpakai.']);
            }
            $quota->fill($data)->save();

            return $quota;
        });
    }
}
