<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Site\SaveSitePage;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSitePageRequest;
use App\Models\SitePage;
use App\Services\SiteContent;
use App\SitePageKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', SitePage::class);
        $saved = SitePage::with('editor:id,name')->get()->keyBy(fn (SitePage $page): string => $page->key->value);

        return Inertia::render('admin/site/index', [
            'pages' => collect(SitePageKey::cases())->map(fn (SitePageKey $key): array => [
                'key' => $key->value,
                'label' => $key->label(),
                'description' => $key->description(),
                'public_url' => route($key->publicRouteName()),
                'updated_at' => $saved->get($key->value)?->updated_at,
                'updated_by' => $saved->get($key->value)?->editor?->name,
            ])->values(),
        ]);
    }

    public function edit(SitePageKey $page, SiteContent $content): Response
    {
        Gate::authorize('viewAny', SitePage::class);

        return Inertia::render('admin/site/edit', [
            'page' => ['key' => $page->value, 'label' => $page->label(), 'description' => $page->description(), 'public_url' => route($page->publicRouteName())],
            'content' => $content->get($page),
        ]);
    }

    public function update(UpdateSitePageRequest $request, SitePageKey $page, SaveSitePage $save): RedirectResponse
    {
        $save->handle($page, $request->validated(), $request->user());

        return to_route('admin.site.index')->with('success', $page->label().' berhasil disimpan.');
    }
}
