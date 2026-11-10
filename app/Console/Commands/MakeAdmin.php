<?php

namespace App\Console\Commands;

use App\AdminRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class MakeAdmin extends Command
{
    protected $signature = 'app:make-admin {email} {--name=} {--role=admin : admin, editor or author}';

    protected $description = 'Create an administrator, or promote an existing account';

    public function handle(): int
    {
        $role = AdminRole::tryFrom((string) $this->option('role'));
        if ($role === null) {
            $this->error('Role must be one of: admin, editor, author.');

            return self::FAILURE;
        }
        $email = (string) $this->argument('email');
        $name = (string) ($this->option('name') ?: 'Administrator');
        $user = User::where('email', $email)->first();
        if ($user === null) {
            if (! $this->input->isInteractive()) {
                $this->error('Create an account first, or run interactively to enter a password securely.');

                return self::FAILURE;
            }
            $password = $this->secret('Password');
            Validator::make(compact('name', 'email', 'password'), ['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'], 'password' => ['required', Password::defaults()]])->validate();
            $user = new User(compact('name', 'email', 'password'));
        }
        $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now()]);
        $user->assignStaffRole($role);
        $this->info("Staff account ready with role {$role->value}.");

        return self::SUCCESS;
    }
}
