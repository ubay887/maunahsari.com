<?php

namespace Database\Factories;

use App\Models\SitePage;
use App\Services\SiteDefaults;
use App\SitePageKey;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SitePage> */
class SitePageFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['key' => SitePageKey::Contact, 'content' => SiteDefaults::for(SitePageKey::Contact)];
    }

    public function forKey(SitePageKey $key): static
    {
        return $this->state(fn (): array => ['key' => $key, 'content' => SiteDefaults::for($key)]);
    }
}
