<?php

namespace App\Actions\Users;

use App\Actions\Alumni\DeleteAccount;
use App\Models\AuditLog;
use App\Models\User;
use App\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteUser
{
    public function __construct(private DeleteAccount $deleteAccount) {}

    public function handle(User $user, User $actor): void
    {
        if ($this->hasRecordsThatBlockDeletion($user)) {
            throw ValidationException::withMessages(['user' => 'Akun ini masih tercatat sebagai penulis artikel, penyelenggara event, atau pencatat pembayaran. Alihkan atau hapus data tersebut lebih dulu.']);
        }
        $id = $user->id;
        $meta = ['role' => $user->role === UserRole::Admin ? $user->getRoleNames()->first() : $user->role->value];

        if ($user->role === UserRole::Alumni) {
            $this->deleteAccount->handle($user);
        } else {
            DB::transaction(function () use ($user): void {
                DB::table('sessions')->where('user_id', $user->id)->delete();
                DB::table('password_reset_tokens')->where('email', $user->email)->delete();
                $user->delete();
            });
        }
        AuditLog::create(['actor_id' => $actor->id, 'action' => 'user.deleted', 'subject_type' => 'user', 'subject_id' => $id, 'meta' => $meta]);
    }

    private function hasRecordsThatBlockDeletion(User $user): bool
    {
        return DB::table('articles')->where('author_id', $user->id)->exists()
            || DB::table('events')->where('organizer_id', $user->id)->exists()
            || DB::table('applicant_payments')->where('recorded_by', $user->id)->exists();
    }
}
