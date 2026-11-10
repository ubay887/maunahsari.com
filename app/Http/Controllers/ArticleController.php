<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Article::published()->with(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug'])->search($request->string('search')->toString());
        if ($request->filled('category')) {
            $query->whereHas('categories', fn (Builder $query): Builder => $query->where('slug', $request->string('category')->toString()));
        }
        if ($request->filled('tag')) {
            $query->whereHas('tags', fn (Builder $query): Builder => $query->where('slug', $request->string('tag')->toString()));
        }

        return Inertia::render('articles/index', [
            'articles' => $query->orderByDesc('published_at')->orderByDesc('id')->paginate(12)->withQueryString(),
            'categories' => Category::whereHas('articles', fn (Builder $query): Builder => $query->published())->orderBy('name')->get(['id', 'name', 'slug']),
            'tags' => Tag::whereHas('articles', fn (Builder $query): Builder => $query->published())->orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => ['search' => $request->string('search')->toString(), 'category' => $request->string('category')->toString(), 'tag' => $request->string('tag')->toString()],
            'canonical' => route('articles.index', $request->only(['search', 'category', 'tag', 'page'])),
        ]);
    }

    public function show(Request $request, Article $article): Response
    {
        $published = Article::published()->whereKey($article->id)->exists();
        $preview = $request->boolean('preview') && ($request->user()?->hasVerifiedEmail() ?? false) && $request->user()->can('view', $article);
        abort_unless($published || $preview, 404);
        $article->load(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug']);
        if ($published && ! $preview && ! preg_match('/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp/i', $request->userAgent() ?? '')) {
            $article->increment('views_count', 1, ['updated_at' => $article->updated_at]);
        }
        $canonical = route('articles.show', $article->slug);

        return Inertia::render('articles/show', [
            'article' => $article,
            'preview' => $preview,
            'canonical' => $canonical,
            'description' => $article->meta_description ?: Str::limit(strip_tags($article->excerpt ?: $article->content), 160, ''),
            'shareUrl' => 'https://wa.me/?text='.rawurlencode($article->title.' '.$canonical),
            'related' => Article::published()->with(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug'])->whereKeyNot($article->id)
                ->whereHas('categories', fn (Builder $query): Builder => $query->whereIn('categories.id', $article->categories->modelKeys()))
                ->orderByDesc('published_at')->orderByDesc('id')->limit(3)->get(),
        ]);
    }
}
