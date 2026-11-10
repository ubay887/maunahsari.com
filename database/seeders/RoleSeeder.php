<?php

namespace Database\Seeders;

use App\AdminRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Create the admin roles. Safe to run on every deploy.
     */
    public function run(): void
    {
        foreach (AdminRole::cases() as $role) {
            Role::findOrCreate($role->value, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
