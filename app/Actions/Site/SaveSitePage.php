<?php

namespace App\Actions\Site;

use App\Models\SitePage;
use App\Models\User;
use App\Services\ArticleHtmlSanitizer;
use App\Services\SiteContent;
use App\SitePageKey;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class SaveSitePage
{
    public function __construct(private ArticleHtmlSanitizer $sanitizer, private SiteContent $content) {}

    /** @param array<string, mixed> $data */
    public function handle(SitePageKey $key, array $data, User $user): SitePage
    {
        foreach ($this->htmlFields($key) as $path) {
            $clean = $this->sanitizer->clean((string) Arr::get($data, $path));

            if (trim(html_entity_decode(strip_tags($clean))) === '') {
                throw ValidationException::withMessages([$path => 'Isi tidak boleh kosong setelah dibersihkan.']);
            }

            Arr::set($data, $path, $clean);
        }

        $page = SitePage::updateOrCreate(['key' => $key->value], ['content' => $data, 'updated_by' => $user->id]);
        $this->content->forget($key);

        return $page;
    }

    /** @return list<string> */
    private function htmlFields(SitePageKey $key): array
    {
        return $key === SitePageKey::Profile
            ? ['history_html', 'location_html', 'founder.bio_html', 'caretaker.bio_html']
            : [];
    }
}
