<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Users\ChangeStaffRole;
use App\Actions\Users\CreateStaffAccount;
use App\Actions\Users\DeleteUser;
use App\AdminRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StaffAccountRequest;
use App\Http\Requests\StaffRoleRequest;
use App\Http\Requests\UserIndexRequest;
use App\Models\User;
use App\UserRole;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(UserIndexRequest $request, #[CurrentUser] User $admin): Response
    {
        $filters = $request->validated();
        $search = trim((string) ($filters['search'] ?? ''));
        $role = $filters['role'] ?? null;

        $users = User::query()->with('roles:id,name')
            ->when($search !== '', fn (Builder $query): Builder => $query->where(fn (Builder $query): Builder => $query->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%')))
            ->when($role !== null, fn (Builder $query): Builder => AdminRole::tryFrom($role) !== null
                ? $query->where('role', UserRole::Admin)->role($role)
                : $query->where('role', $role))
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->orderBy('id')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role === UserRole::Admin ? ($user->roles->first()?->name ?? AdminRole::Author->value) : $user->role->value,
                'is_staff' => $user->role === UserRole::Admin,
                'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
                'created_at' => $user->created_at?->toISOString(),
                'is_self' => $user->is($admin),
            ]);

        return Inertia::render('admin/users/index', ['users' => $users, 'filters' => $filters]);
    }

    public function store(StaffAccountRequest $request, CreateStaffAccount $create, #[CurrentUser] User $admin): RedirectResponse
    {
        $result = $create->handle($request->string('name')->toString(), $request->string('email')->toString(), $request->enum('role', AdminRole::class), $admin);
        Inertia::flash('temporaryPassword', ['name' => $result['user']->name, 'email' => $result['user']->email, 'password' => $result['password']]);

        return back();
    }

    public function update(StaffRoleRequest $request, User $user, ChangeStaffRole $change, #[CurrentUser] User $admin): RedirectResponse
    {
        $change->handle($user, $request->enum('role', AdminRole::class), $admin);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Peran diperbarui.']);

        return back();
    }

    public function destroy(User $user, DeleteUser $delete, #[CurrentUser] User $admin): RedirectResponse
    {
        Gate::authorize('delete', $user);
        $delete->handle($user, $admin);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Akun dihapus.']);

        return back();
    }
}
