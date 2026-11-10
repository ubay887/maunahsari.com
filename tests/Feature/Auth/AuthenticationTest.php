<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\DemoRoleAccountSeeder;
use Database\Seeders\DemoUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered()
    {
        $response = $this->get(route('login'));

        $response->assertOk();
    }

    public function test_users_can_authenticate_using_the_login_screen()
    {
        $user = User::factory()->admin()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_login_screen_lists_demo_accounts_in_local_and_testing_environments()
    {
        $this->get(route('login'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->has('demoAccounts', 5)
            ->where('demoAccounts.0.key', 'admin')
            ->where('demoAccounts.0.email', 'admin@example.test')
            ->where('demoAccounts.0.password', 'password'));
    }

    public function test_login_screen_never_exposes_demo_credentials_outside_local_and_testing()
    {
        app()->detectEnvironment(fn (): string => 'production');

        $this->get(route('login'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('demoAccounts', []));
    }

    public function test_every_demo_account_can_sign_in_and_lands_on_its_own_home()
    {
        $this->seed([DemoUserSeeder::class, DemoRoleAccountSeeder::class]);

        $homes = ['admin' => 'dashboard', 'editor' => 'dashboard', 'author' => 'dashboard', 'alumni' => 'alumni.home', 'applicant' => 'psb.portal.home'];

        foreach (config('demo.accounts') as $key => $account) {
            $this->post(route('login.store'), ['email' => $account['email'], 'password' => config('demo.password')])
                ->assertRedirect(route($homes[$key], absolute: false));
            $this->assertAuthenticated();
            $this->post(route('logout'));
        }
    }

    public function test_users_with_two_factor_enabled_are_redirected_to_two_factor_challenge()
    {
        $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $user = User::factory()->withTwoFactor()->create();

        $response = $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $response->assertSessionHas('login.id', $user->id);
        $this->assertGuest();
    }

    public function test_users_can_not_authenticate_with_invalid_password()
    {
        $user = User::factory()->admin()->create();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout()
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $response->assertRedirect(route('home'));

        $this->assertGuest();
    }

    public function test_users_are_rate_limited()
    {
        $user = User::factory()->admin()->create();

        RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertTooManyRequests();
    }
}
