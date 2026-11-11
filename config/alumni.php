<?php

return [
    'privacy_version' => '2026-11-03',
    'contact_name' => env('ALUMNI_CONTACT_NAME', 'Pengurus Alumni Maunahsari'),
    'contact_email' => env('ALUMNI_CONTACT_EMAIL'),
    'contact_whatsapp' => env('ALUMNI_CONTACT_WHATSAPP'),
    'contact_daily_limit' => (int) env('ALUMNI_CONTACT_DAILY_LIMIT', 10),
    'tile_url' => env('ALUMNI_TILE_URL') ?: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    'tile_dark_url' => env('ALUMNI_TILE_DARK_URL') ?: null,
    'tile_attribution' => env('ALUMNI_TILE_ATTRIBUTION') ?: '<a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>',
];
