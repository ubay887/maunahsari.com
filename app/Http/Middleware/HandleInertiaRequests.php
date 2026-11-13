<?php

namespace App\Http\Middleware;

use App\Models\AlumniProfile;
use App\Models\Applicant;
use App\Models\Article;
use App\Models\Event;
use App\Models\SitePage;
use App\Models\User;
use App\Services\SiteContent;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'ogImage' => url('/images/og-image.jpg'),
            'siteInfo' => fn (): array => app(SiteContent::class)->contactInfo(),
            'siteAccess' => ['canManage' => $request->user()?->can('viewAny', SitePage::class) ?? false],
            'alumniAccess' => ['canBrowse' => $request->user()?->can('browse-alumni') ?? false, 'hasProfile' => $request->user()?->alumniProfile !== null],
            'articleAccess' => ['canWrite' => $request->user()?->can('viewAny', Article::class) ?? false],
            'psbAccess' => ['canManage' => $request->user()?->can('viewAny', Applicant::class) ?? false],
            'alumniAdminAccess' => ['canManage' => $request->user()?->can('viewAny', AlumniProfile::class) ?? false],
            'userAdminAccess' => ['canManage' => $request->user()?->can('viewAny', User::class) ?? false],
            'eventAccess' => ['canManage' => $request->user()?->can('viewAny', Event::class) ?? false],
            'articleFlash' => fn (): ?string => $request->hasSession() ? $request->session()->get('success') : null,
            'auth' => [
                'user' => $request->user()?->only(['id', 'name', 'email', 'role', 'created_at', 'updated_at']),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
