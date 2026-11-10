<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AlumniMapCache
{
    public static function invalidate(): void
    {
        Cache::forever('alumni-map-version', Str::uuid()->toString());
    }

    public static function version(): string
    {
        return (string) Cache::get('alumni-map-version', 'initial');
    }
}
