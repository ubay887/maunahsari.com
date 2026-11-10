<?php

namespace App\Services;

use App\Models\SitePage;
use App\SitePageKey;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;

/**
 * Reads the editable public-page content. The saved copy wins, otherwise the
 * built-in defaults are used, so the site never renders empty.
 */
class SiteContent
{
    /** @return array<string, mixed> */
    public function get(SitePageKey $key): array
    {
        try {
            return Cache::rememberForever(
                $this->cacheKey($key),
                fn (): array => SitePage::where('key', $key->value)->first()?->content ?? SiteDefaults::for($key),
            );
        } catch (QueryException) {
            return SiteDefaults::for($key);
        }
    }

    /**
     * Contact page content with a ready-to-use WhatsApp link per contact.
     *
     * @return array<string, mixed>
     */
    public function contactInfo(): array
    {
        $content = $this->get(SitePageKey::Contact);
        $content['contacts'] = array_map(
            fn (array $contact): array => [...$contact, 'href' => 'https://wa.me/'.PsbPhone::normalize($contact['phone'])],
            $content['contacts'],
        );

        return $content;
    }

    public function forget(SitePageKey $key): void
    {
        Cache::forget($this->cacheKey($key));
    }

    private function cacheKey(SitePageKey $key): string
    {
        return 'site-page:'.$key->value;
    }
}
