<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxiesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Route::get('/_proxy-check', fn () => response()->json([
            'secure' => request()->isSecure(),
            'generated_url' => url('/example'),
        ]));
    }

    public function test_forwarded_https_from_the_reverse_proxy_is_honoured(): void
    {
        $response = $this->withHeaders(['X-Forwarded-Proto' => 'https'])
            ->get('/_proxy-check');

        $response->assertOk()
            ->assertJson(['secure' => true])
            ->assertJsonPath('generated_url', fn (string $url): bool => str_starts_with($url, 'https://'));
    }

    public function test_plain_http_requests_stay_insecure(): void
    {
        $this->get('/_proxy-check')
            ->assertOk()
            ->assertJson(['secure' => false]);
    }
}
