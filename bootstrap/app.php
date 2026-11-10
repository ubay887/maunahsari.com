<?php

use App\Http\Middleware\EnsureApprovedAlumni;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsAlumni;
use App\Http\Middleware\EnsureUserIsApplicant;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetRoleRedirects;
use App\Http\Middleware\ThrottleAlumniRegistration;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['admin' => EnsureUserIsAdmin::class, 'alumni.approved' => EnsureApprovedAlumni::class, 'alumni.only' => EnsureUserIsAlumni::class, 'applicant.only' => EnsureUserIsApplicant::class]);
        $middleware->prependToPriorityList(before: SubstituteBindings::class, prepend: EnsureUserIsAdmin::class);
        $middleware->redirectUsersTo(fn (Request $request): string => route($request->user()?->homeRouteName() ?? 'home'));
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            SetRoleRedirects::class,
            ThrottleAlumniRegistration::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
