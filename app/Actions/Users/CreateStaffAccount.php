<?php

namespace App\Actions\Users;

use App\AdminRole;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateStaffAccount
{
    /**
     * Membuat akun staf dengan kata sandi sementara yang hanya dikembalikan sekali.
     *
     * @return array{user: User, password: string}
     */
    public function handle(string $name, string $email, AdminRole $role, User $actor): array
    {
        $password = Str::password(14, symbols: false);

        $user = DB::transaction(function () use ($name, $email, $role, $password, $actor): User {
            $user = new User(['name' => $name, 'email' => $email, 'password' => $password]);
            $user->save();
            $user->assignStaffRole($role);
            AuditLog::create(['actor_id' => $actor->id, 'action' => 'user.created', 'subject_type' => 'user', 'subject_id' => $user->id, 'meta' => ['role' => $role->value]]);

            return $user;
        });

        return ['user' => $user, 'password' => $password];
    }
}
