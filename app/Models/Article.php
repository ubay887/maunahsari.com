<?php

namespace App\Models;

use App\ArticleStatus;
use Carbon\CarbonInterface;
use Database\Factories\ArticleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** @property CarbonInterface|null $published_at */
#[Fillable(['title', 'slug', 'excerpt', 'content', 'cover_image', 'status', 'published_at', 'author_id', 'meta_title', 'meta_description'])]
class Article extends Model
{
    /** @var list<string> */
    protected $appends = ['cover_url'];

    /** @return Attribute<string|null, never> */
    protected function coverUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->cover_image ? Storage::disk('public')->url($this->cover_image) : null);
    }

    /** @use HasFactory<ArticleFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (Article $article): void {
            if (! $article->slug) {
                $base = Str::limit(Str::slug($article->title) ?: 'artikel', 240, '');
                $slug = $base;
                $suffix = 2;
                while (static::withTrashed()->where('slug', $slug)->when($article->exists, fn (Builder $query): Builder => $query->whereKeyNot($article->id))->exists()) {
                    $slug = $base.'-'.$suffix++;
                }
                $article->slug = $slug;
            }
        });
        static::forceDeleted(function (Article $article): void {
            if ($article->cover_image) {
                Storage::disk('public')->delete($article->cover_image);
            }
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['status' => ArticleStatus::class, 'published_at' => 'datetime', 'views_count' => 'integer'];
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** @return BelongsToMany<Category, $this> */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /** @return BelongsToMany<Tag, $this> */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /** @param Builder<Article> $query */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->whereIn('status', [ArticleStatus::Published, ArticleStatus::Scheduled])
            ->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /** @param Builder<Article> $query */
    #[Scope]
    protected function search(Builder $query, ?string $term): void
    {
        if ($term !== null && trim($term) !== '') {
            $query->where(fn (Builder $search): Builder => $search->whereLike('title', '%'.$term.'%')->orWhereLike('excerpt', '%'.$term.'%'));
        }
    }
}
