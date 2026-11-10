<?php

namespace App\Actions\Psb;

use App\Models\RegistrationPeriod;
use App\Pondok;
use Illuminate\Support\Facades\DB;

class RegistrationNumber
{
    /** The caller holds the period lock until the applicant has been saved. */
    public function next(RegistrationPeriod $period, Pondok $pondok): string
    {
        DB::table('registration_sequences')->insertOrIgnore(['registration_period_id' => $period->id, 'pondok' => $pondok->value, 'last_number' => 0]);
        $sequence = DB::table('registration_sequences')->where('registration_period_id', $period->id)->where('pondok', $pondok->value);
        $sequence->increment('last_number');
        $number = $sequence->value('last_number');

        return sprintf('PSB%s-%d-%s-%04d', substr($period->academic_year, 2, 2), $period->id, $pondok === Pondok::Putra ? 'P' : 'W', $number);
    }
}
