<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaxonomyRequest;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TaxonomyController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('manageTaxonomies', Article::class);

        return Inertia::render('admin/articles/taxonomies', ['categories' => Category::with('parent:id,name')->withCount(['articles', 'events'])->orderBy('name')->get(), 'tags' => Tag::withCount('articles')->orderBy('name')->get()]);
    }

    public function store(TaxonomyRequest $request, string $taxonomy): RedirectResponse
    {
        if ($taxonomy === 'categories') {
            Category::create($request->safe()->only(['name', 'slug', 'parent_id']));
        } else {
            Tag::create($request->safe()->only(['name', 'slug']));
        }

        return back()->with('success', 'Taksonomi ditambahkan.');
    }

    public function update(TaxonomyRequest $request, string $taxonomy, int $id): RedirectResponse
    {
        $record = $taxonomy === 'categories' ? Category::findOrFail($id) : Tag::findOrFail($id);
        $record->update($request->safe()->only($taxonomy === 'categories' ? ['name', 'slug', 'parent_id'] : ['name', 'slug']));

        return back()->with('success', 'Taksonomi diperbarui.');
    }

    public function destroy(string $taxonomy, int $id): RedirectResponse
    {
        Gate::authorize('manageTaxonomies', Article::class);
        $record = $taxonomy === 'categories' ? Category::findOrFail($id) : Tag::findOrFail($id);
        $record->delete();

        return back()->with('success', 'Taksonomi dihapus.');
    }
}
