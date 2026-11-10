<?php

namespace App\Actions\Alumni;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteAccount
{
    public function handle(User $user): void
    {
        $profile = $user->alumniProfile()->withTrashed()->first();
        $photo = $profile?->photo_path;
        DB::transaction(function () use ($user, $profile): void {
            $profile?->forceDelete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            AuditLog::where('actor_id', $user->id)->update(['actor_id' => null]);
            $user->delete();
            AuditLog::create(['action' => 'account.deleted', 'meta' => ['scope' => 'alumni']]);
        });
        if ($photo) {
            Storage::disk('local')->delete($photo);
        }
    }
}
