<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Users\ResetUserPassword;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class UserPasswordController extends Controller
{
    public function __invoke(User $user, ResetUserPassword $reset, #[CurrentUser] User $admin): RedirectResponse
    {
        Gate::authorize('resetPassword', $user);
        $password = $reset->handle($user, $admin);
        Inertia::flash('temporaryPassword', ['name' => $user->name, 'email' => $user->email, 'password' => $password]);

        return back();
    }
}
