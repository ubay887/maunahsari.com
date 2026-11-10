<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\ApplicantDocument;
use App\Models\Program;
use App\Models\ProgramQuota;
use App\Models\RegistrationPeriod;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class PsbPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_psb_policy_only_allows_existing_admin_allowlist(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'admin@example.test']);
        $other = User::factory()->create();
        foreach ([Applicant::factory()->create(), ApplicantDocument::factory()->create(), Program::factory()->create(), ProgramQuota::factory()->create(), RegistrationPeriod::factory()->create()] as $model) {
            foreach (['viewAny', 'create'] as $ability) {
                $this->assertTrue(Gate::forUser($admin)->allows($ability, $model::class));
                $this->assertFalse(Gate::forUser($other)->allows($ability, $model::class));
            }
            foreach (['view', 'update', 'delete'] as $ability) {
                $this->assertTrue(Gate::forUser($admin)->allows($ability, $model));
                $this->assertFalse(Gate::forUser($other)->allows($ability, $model));
            }
        }
        $santri = Santri::factory()->create();
        foreach (['viewAny', 'view'] as $ability) {
            $this->assertTrue(Gate::forUser($admin)->allows($ability, $ability === 'viewAny' ? Santri::class : $santri));
            $this->assertFalse(Gate::forUser($other)->allows($ability, $ability === 'viewAny' ? Santri::class : $santri));
        }
        foreach (['create', 'update', 'delete'] as $ability) {
            $this->assertFalse(Gate::forUser($admin)->allows($ability, $ability === 'create' ? Santri::class : $santri));
        }
    }
}
