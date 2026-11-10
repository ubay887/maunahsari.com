<?php

namespace Database\Seeders;

use App\Models\SitePage;
use App\Services\SiteDefaults;
use App\SitePageKey;
use Illuminate\Database\Seeder;

class SitePageSeeder extends Seeder
{
    /** Seeds the built-in content once; edited pages are never overwritten. */
    public function run(): void
    {
        foreach (SitePageKey::cases() as $key) {
            SitePage::firstOrCreate(['key' => $key->value], ['content' => SiteDefaults::for($key)]);
        }
    }
}
