<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DataGridShowcaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get(route('showcase.data-grid'));

        $response->assertRedirect(route('login'));
    }

    public function test_verified_users_receive_demo_invoices_after_the_initial_page_load(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->get(route('showcase.data-grid'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('data-grid-showcase')
            ->missing('invoices')
            ->loadDeferredProps(fn (Assert $data) => $data
                ->has('invoices', 48)
                ->where('invoices.0.number', 'INV-2026-001')
                ->where('invoices.0.customer', 'Nabila Rahma')
                ->where('invoices.0.amount', 149000)
                ->where('invoices.47.id', 'invoice-048')
                ->where('invoices.47.status', 'pending')
                ->where('invoices.47.plan', 'Business')
                ->where('invoices.47.amount', 369000)
                ->where('invoices.47.issued', '2026-11-17')
            )
        );
        $this->assertDatabaseCount('users', 1);
    }

    public function test_unverified_users_cannot_load_the_showcase(): void
    {
        $user = User::factory()->admin()->unverified()->create();

        $response = $this->actingAs($user)->get(route('showcase.data-grid'));

        $response->assertRedirect(route('verification.notice'));
    }
}
