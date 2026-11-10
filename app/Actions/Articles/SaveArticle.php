<?php

namespace App\Actions\Articles;

use App\ArticleStatus;
use App\Http\Requests\StoreArticleRequest;
use App\Models\Article;
use App\Models\Tag;
use App\Services\ArticleHtmlSanitizer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class SaveArticle
{
    public function __construct(private ArticleHtmlSanitizer $sanitizer) {}

    public function handle(StoreArticleRequest $request, Article $article): Article
    {
        $oldCover = $article->cover_image;
        $newCover = $request->file('cover_image')?->store('articles', 'public');
        try {
            DB::transaction(function () use ($request, $article, $newCover): void {
                $attributes = $request->safe()->except(['category_ids', 'tag_names', 'cover_image', 'remove_cover']);
                if ($article->exists && ($attributes['slug'] ?? null) === null) {
                    unset($attributes['slug']);
                }
                $attributes['content'] = $this->sanitizer->clean($request->string('content')->toString());
                if (trim(html_entity_decode(strip_tags($attributes['content']), ENT_QUOTES | ENT_HTML5, 'UTF-8')) === '' && ! str_contains($attributes['content'], '<img ')) {
                    throw ValidationException::withMessages(['content' => 'Konten artikel wajib diisi.']);
                }
                if ($request->input('status') === ArticleStatus::Published->value && ! $request->filled('published_at')) {
                    $attributes['published_at'] = now();
                }
                if ($newCover) {
                    $attributes['cover_image'] = $newCover;
                } elseif ($request->boolean('remove_cover')) {
                    $attributes['cover_image'] = null;
                }
                if (! $article->exists) {
                    $attributes['author_id'] = $request->user()?->id;
                }
                $article->fill($attributes)->save();
                $article->categories()->sync($request->array('category_ids'));
                $tagIds = [];
                foreach ($request->array('tag_names') as $name) {
                    if (! is_string($name)) {
                        continue;
                    }
                    $slug = Str::slug($name) ?: 'tag-'.substr(hash('sha256', $name), 0, 12);
                    $tagIds[] = Tag::firstOrCreate(['slug' => $slug], ['name' => trim($name)])->id;
                }
                $article->tags()->sync($tagIds);
            });
        } catch (Throwable $exception) {
            if ($newCover) {
                Storage::disk('public')->delete($newCover);
            }
            throw $exception;
        }
        if ($oldCover && ($newCover || $request->boolean('remove_cover'))) {
            Storage::disk('public')->delete($oldCover);
        }

        return $article;
    }
}
