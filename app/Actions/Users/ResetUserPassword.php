<?php

namespace App\Actions\Users;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ResetUserPassword
{
    /** Mengganti kata sandi, mengeluarkan semua sesi, dan mengembalikan kata sandi sementara sekali. */
    public function handle(User $user, User $actor): string
    {
        $password = Str::password(14, symbols: false);

        DB::transaction(function () use ($user, $actor, $password): void {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            AuditLog::create(['actor_id' => $actor->id, 'action' => 'user.password_reset', 'subject_type' => 'user', 'subject_id' => $user->id]);
        });

        return $password;
    }
}
