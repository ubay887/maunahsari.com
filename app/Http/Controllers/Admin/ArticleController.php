<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Articles\SaveArticle;
use App\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Services\ArticleAccess;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request, #[CurrentUser] User $user, ArticleAccess $access): Response
    {
        Gate::authorize('viewAny', Article::class);
        $sort = in_array($request->input('sort'), ['title', 'status', 'published_at', 'created_at', 'updated_at', 'views_count'], true) ? $request->string('sort')->toString() : 'created_at';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';
        $query = Article::with(['author:id,name', 'categories:id,name', 'tags:id,name'])->search($request->string('search')->toString());
        if (! $access->canPublish($user)) {
            $query->whereBelongsTo($user, 'author');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }
        if ($request->filled('category')) {
            $query->whereHas('categories', fn (Builder $query): Builder => $query->whereKey($request->integer('category')));
        }

        return Inertia::render('admin/articles/index', [
            'articles' => $query->select(['articles.id', 'title', 'slug', 'excerpt', 'status', 'cover_image', 'author_id', 'views_count', 'published_at', 'created_at', 'updated_at'])->orderBy($sort, $direction)->orderByDesc('id')->paginate(min(50, max(5, $request->integer('per_page', 10))))->withQueryString(),
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug', 'parent_id']),
            'filters' => ['search' => $request->string('search')->toString(), 'status' => $request->string('status')->toString(), 'category' => $request->string('category')->toString(), 'sort' => $sort, 'direction' => $direction],
            'canPublish' => $user->can('publish', Article::class),
            'canManageTaxonomies' => $user->can('manageTaxonomies', Article::class),
        ]);
    }

    public function show(#[CurrentUser] User $user, Article $article): Response
    {
        Gate::authorize('view', $article);

        return Inertia::render('admin/articles/show', [
            'article' => $article->load(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug']),
            'canUpdate' => $user->can('update', $article),
            'canPublish' => $user->can('publish', $article),
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Article::class);

        return Inertia::render('admin/articles/create', $this->formProps($request));
    }

    public function store(StoreArticleRequest $request, SaveArticle $save): RedirectResponse
    {
        $save->handle($request, new Article);

        return to_route('admin.articles.index')->with('success', 'Artikel berhasil disimpan.');
    }

    public function edit(Request $request, Article $article): Response
    {
        Gate::authorize('update', $article);

        return Inertia::render('admin/articles/edit', [...$this->formProps($request), 'article' => $article->load(['categories', 'tags'])]);
    }

    public function update(UpdateArticleRequest $request, Article $article, SaveArticle $save): RedirectResponse
    {
        $save->handle($request, $article);

        return to_route('admin.articles.index')->with('success', 'Artikel berhasil diperbarui.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        Gate::authorize('delete', $article);
        $article->delete();

        return to_route('admin.articles.index')->with('success', 'Artikel dihapus.');
    }

    /** @return array<string, mixed> */
    private function formProps(Request $request): array
    {
        return [
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug', 'parent_id']),
            'tags' => Tag::orderBy('name')->get(['id', 'name', 'slug']),
            'canPublish' => $request->user()?->can('publish', Article::class),
            'timezone' => config('app.timezone'),
            'statuses' => array_map(fn (ArticleStatus $status): array => ['value' => $status->value, 'label' => $status->label()], ArticleStatus::cases()),
        ];
    }
}
