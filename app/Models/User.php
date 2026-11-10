<?php

namespace App\Models;

use App\AdminRole;
use App\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property UserRole $role
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @return HasOne<AlumniProfile, $this> */
    public function alumniProfile(): HasOne
    {
        return $this->hasOne(AlumniProfile::class);
    }

    /** @return HasOne<Applicant, $this> */
    public function applicant(): HasOne
    {
        return $this->hasOne(Applicant::class);
    }

    /** Nama rute beranda sesuai role akun: dasbor admin, portal calon santri, atau portal alumni. */
    public function homeRouteName(): string
    {
        return match ($this->role) {
            UserRole::Admin => 'dashboard',
            UserRole::Applicant => 'psb.portal.home',
            default => 'alumni.home',
        };
    }

    /**
     * Whether the account belongs to staff and may enter the admin panel.
     * What staff can do inside is decided by their {@see AdminRole}.
     */
    public function canAccessAdminPanel(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /** Full administrator: staff account that holds the admin role. */
    public function isAdmin(): bool
    {
        return $this->canAccessAdminPanel() && $this->hasRole(AdminRole::Admin->value);
    }

    /** Turn the account into staff with exactly one admin role. */
    public function assignStaffRole(AdminRole $role): static
    {
        $this->role = UserRole::Admin;
        $this->save();
        $this->syncRoles([Role::findOrCreate($role->value, 'web')]);

        return $this;
    }

    /** @return HasMany<Article, $this> */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
