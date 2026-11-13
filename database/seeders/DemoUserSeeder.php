<?php

namespace Database\Seeders;

use App\AdminRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $accounts = [
            'admin@example.test' => 'Demo Admin',
            'demo@example.test' => 'Demo User',
            'test@example.com' => 'Test User',
            'nabila@example.test' => 'Nabila Rahma',
            'farhan@example.test' => 'Farhan Pratama',
        ];

        foreach ($accounts as $email => $name) {
            $this->ensureStaff(User::query()->firstOrCreate(
                ['email' => $email],
                User::factory()->admin()->make([
                    'name' => $name,
                    'email' => $email,
                ])->getAttributes(),
            ));
        }
    }

    /**
     * Give a freshly seeded account the admin role, keeping roles set later.
     */
    private function ensureStaff(User $user): void
    {
        if ($user->roles()->doesntExist()) {
            $user->assignStaffRole(AdminRole::Admin);
        }
    }
}
