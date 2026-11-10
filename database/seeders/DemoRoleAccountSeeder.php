<?php

namespace Database\Seeders;

use App\AdminRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

/**
 * Akun demo untuk role selain admin (editor, penulis, alumni, calon santri) agar tombol
 * masuk satu klik di halaman login punya tujuan. Daftar akun ada di config/demo.php, admin
 * dibuat oleh {@see DemoUserSeeder}; data pendaftar calon santri oleh {@see DemoApplicantSeeder}.
 * Aman dijalankan ulang; hanya berjalan di local/testing.
 */
class DemoRoleAccountSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $this->staff('editor', AdminRole::Editor);
        $this->staff('author', AdminRole::Author);
        $this->alumnus();
        $this->account('applicant', applicant: true);
    }

    private function staff(string $key, AdminRole $role): void
    {
        $user = $this->account($key);

        if ($user->roles()->doesntExist()) {
            $user->assignStaffRole($role);
        }
    }

    private function alumnus(): void
    {
        $this->account('alumni');
    }

    private function account(string $key, bool $applicant = false): User
    {
        /** @var array{name: string, email: string} $account */
        $account = config('demo.accounts.'.$key);

        $factory = $applicant ? User::factory()->applicant() : User::factory();

        return User::query()->firstOrCreate(
            ['email' => $account['email']],
            $factory->make(Arr::only($account, ['name', 'email']))->getAttributes(),
        );
    }
}
