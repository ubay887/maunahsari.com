<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Program;
use App\Models\User;
use App\UserRole;
use Database\Seeders\DemoApplicantSeeder;
use Database\Seeders\DemoUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeding_creates_demo_accounts_with_working_passwords(): void
    {
        Notification::fake();

        $this->seed();

        $this->assertDatabaseCount('users', 9);
        $this->assertDatabaseCount('provinces', 38);
        $this->assertDatabaseCount('regencies', 514);
        $this->assertDatabaseHas('users', ['email' => 'admin@example.test', 'name' => 'Demo Admin']);
        $this->assertDatabaseHas('users', ['email' => 'demo@example.test', 'name' => 'Demo User']);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com', 'name' => 'Test User']);
        $this->assertDatabaseHas('users', ['email' => 'nabila@example.test', 'name' => 'Nabila Rahma']);
        $this->assertDatabaseHas('users', ['email' => 'farhan@example.test', 'name' => 'Farhan Pratama']);

        foreach (User::query()->get() as $user) {
            $this->assertTrue(Hash::check('password', $user->password));
            $this->assertNull($user->two_factor_secret);
            $this->assertNull($user->two_factor_recovery_codes);
            $this->assertNull($user->two_factor_confirmed_at);
        }

        Notification::assertNothingSent();
    }

    public function test_seeding_creates_one_demo_account_for_every_role_shown_on_the_login_page(): void
    {
        $this->seed();

        foreach (config('demo.accounts') as $account) {
            $this->assertDatabaseHas('users', ['email' => $account['email'], 'name' => $account['name']]);
        }

        $this->assertTrue(User::where('email', 'editor@example.test')->firstOrFail()->hasRole('editor'));
        $this->assertTrue(User::where('email', 'author@example.test')->firstOrFail()->hasRole('author'));
        $this->assertSame(UserRole::Alumni, User::where('email', 'alumni@example.test')->firstOrFail()->role);

        $applicantUser = User::where('email', 'applicant@example.test')->firstOrFail();
        $this->assertSame(UserRole::Applicant, $applicantUser->role);
        $this->assertDatabaseEmpty('applicants');
    }

    public function test_default_seeding_only_creates_master_data_and_users(): void
    {
        $this->seed();

        $this->assertDatabaseHas('programs', ['id' => Program::query()->value('id')]);
        $this->assertDatabaseHas('registration_periods', ['academic_year' => '2026/2027']);
        $this->assertDatabaseEmpty('articles');
        $this->assertDatabaseEmpty('events');
        $this->assertDatabaseEmpty('site_pages');
        $this->assertDatabaseEmpty('applicants');
        $this->assertDatabaseEmpty('alumni_profiles');
    }

    public function test_demo_applicant_seeder_gives_the_demo_account_one_applicant_record(): void
    {
        $this->seed();
        $this->seed(DemoApplicantSeeder::class);
        $this->seed(DemoApplicantSeeder::class);

        $applicantUser = User::where('email', 'applicant@example.test')->firstOrFail();

        $this->assertSame(1, Applicant::where('user_id', $applicantUser->id)->count());
    }

    public function test_reseeding_does_not_duplicate_or_modify_existing_users(): void
    {
        $existingUser = User::factory()->create([
            'name' => 'Existing Account',
            'email' => 'admin@example.test',
            'password' => 'existing-password',
        ]);
        $unrelatedUser = User::factory()->create();
        $this->seed();
        $originalAccounts = User::query()->orderBy('id')->get()->map->getAttributes()->all();

        $this->seed();

        $this->assertDatabaseCount('users', 10);
        $this->assertModelExists($unrelatedUser);
        $this->assertSame($originalAccounts, User::query()->orderBy('id')->get()->map->getAttributes()->all());
        $this->assertSame('Existing Account', $existingUser->fresh()->name);
        $this->assertTrue(Hash::check('existing-password', $existingUser->fresh()->password));
    }

    #[DataProvider('nonDemoEnvironments')]
    public function test_demo_accounts_are_not_seeded_outside_local_and_testing_environments(string $environment): void
    {
        app()->detectEnvironment(fn (): string => $environment);

        $this->artisan('db:seed', [
            '--class' => DemoUserSeeder::class,
            '--force' => true,
            '--no-interaction' => true,
        ])->assertSuccessful();

        $this->assertDatabaseEmpty('users');
    }

    /**
     * @return array<string, array{string}>
     */
    public static function nonDemoEnvironments(): array
    {
        return [
            'production' => ['production'],
            'staging' => ['staging'],
        ];
    }
}
