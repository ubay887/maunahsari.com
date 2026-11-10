<?php

namespace App\Models;

use App\EventStatus;
use App\EventType;
use Carbon\CarbonImmutable;
use Database\Factories\EventFactory;
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

/**
 * @property CarbonImmutable $start_at
 * @property CarbonImmutable $end_at
 * @property EventStatus $status
 * @property EventType $type
 */
#[Fillable(['title', 'slug', 'summary', 'description', 'banner', 'start_at', 'end_at', 'timezone', 'type', 'location_name', 'address', 'map_url', 'meeting_url', 'registration_url', 'contact_whatsapp', 'status', 'organizer_id', 'meta_title', 'meta_description'])]
class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory, SoftDeletes;

    /** @var list<string> */
    protected $appends = ['banner_url', 'phase'];

    protected static function booted(): void
    {
        static::saving(function (Event $event): void {
            if (! $event->slug) {
                $base = Str::limit(Str::slug($event->title) ?: 'event', 240, '');
                $slug = $base;
                $suffix = 2;
                while (static::withTrashed()->where('slug', $slug)->when($event->exists, fn (Builder $query): Builder => $query->whereKeyNot($event->id))->exists()) {
                    $slug = $base.'-'.$suffix++;
                }
                $event->slug = $slug;
            }
        });
        static::forceDeleted(function (Event $event): void {
            if ($event->banner) {
                Storage::disk('public')->delete($event->banner);
            }
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['status' => EventStatus::class, 'type' => EventType::class, 'start_at' => 'immutable_datetime', 'end_at' => 'immutable_datetime'];
    }

    /** @return Attribute<string|null, never> */
    protected function bannerUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->banner ? Storage::disk('public')->url($this->banner) : null);
    }

    /** @return Attribute<string, never> */
    protected function phase(): Attribute
    {
        return Attribute::get(fn (): string => $this->end_at->lessThanOrEqualTo(now()) ? 'past' : ($this->start_at->isFuture() ? 'upcoming' : 'ongoing'));
    }

    /** @return BelongsTo<User, $this> */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /** @return BelongsToMany<Category, $this> */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /** @param Builder<Event> $query */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->whereIn('status', [EventStatus::Published, EventStatus::Cancelled]);
    }

    /** @param Builder<Event> $query */
    #[Scope]
    protected function upcoming(Builder $query): void
    {
        $query->where('end_at', '>', now());
    }

    /** @param Builder<Event> $query */
    #[Scope]
    protected function past(Builder $query): void
    {
        $query->where('end_at', '<=', now());
    }

    /** @param Builder<Event> $query */
    #[Scope]
    protected function search(Builder $query, ?string $term): void
    {
        if ($term !== null && trim($term) !== '') {
            $query->where(fn (Builder $search): Builder => $search->whereLike('title', '%'.$term.'%')->orWhereLike('summary', '%'.$term.'%'));
        }
    }
}
