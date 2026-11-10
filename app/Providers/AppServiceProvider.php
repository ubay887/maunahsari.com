<?php

namespace App\Providers;

use App\Models\AlumniProfile;
use App\Models\User;
use App\Observers\AlumniProfileObserver;
use App\Services\AlumniPrivacy;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\ExceptionResponse;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(AlumniPrivacy $privacy): void
    {
        Gate::define('browse-alumni', fn (User $user): bool => $privacy->canBrowse($user));
        AlumniProfile::observe(AlumniProfileObserver::class);
        $this->configureDefaults();
        $this->configureErrorPages();
        RateLimiter::for('alumni-claim', fn (Request $request) => Limit::perMinute(5)->by('alumni-claim:'.$request->user()?->id.'|'.$request->ip()));
        RateLimiter::for('alumni-contact', fn (Request $request) => Limit::perDay((int) config('alumni.contact_daily_limit'))->by('alumni-contact:'.$request->user()?->id));
        RateLimiter::for('psb-submit', fn (Request $request) => Limit::perMinute(5)->by('psb-submit:'.$request->ip()));
        RateLimiter::for('psb-portal', fn (Request $request) => Limit::perMinute(20)->by('psb-portal:'.$request->user()?->id));
        RateLimiter::for('psb-status', fn (Request $request) => Limit::perMinute(10)->by('psb-status:'.$request->ip()));
    }

    /**
     * Render 403/404/500/503 as an Inertia page. A 500 keeps the developer
     * error screen while debug mode is on.
     */
    protected function configureErrorPages(): void
    {
        Inertia::handleExceptionsUsing(function (ExceptionResponse $response) {
            $status = $response->statusCode();

            if (! in_array($status, [403, 404, 500, 503], true) || ($status === 500 && config('app.debug'))) {
                return null;
            }

            return $response->render('error', ['status' => $status])->withSharedData();
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        Model::shouldBeStrict(! app()->isProduction());

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
