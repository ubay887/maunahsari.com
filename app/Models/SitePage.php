<?php

namespace App\Models;

use App\SitePageKey;
use Database\Factories\SitePageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property SitePageKey $key
 * @property array<string, mixed> $content
 */
#[Fillable(['key', 'content', 'updated_by'])]
class SitePage extends Model
{
    /** @use HasFactory<SitePageFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['key' => SitePageKey::class, 'content' => 'array'];
    }

    /** @return BelongsTo<User, $this> */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
