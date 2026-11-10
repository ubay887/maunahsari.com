<?php

namespace App\Http\Controllers;

use App\Services\ArticleSyndication;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArticleSyndicationController extends Controller
{
    public function feed(ArticleSyndication $syndication): Response
    {
        return response($syndication->rss(), 200, ['Content-Type' => 'application/rss+xml; charset=UTF-8']);
    }

    public function sitemap(ArticleSyndication $syndication): StreamedResponse
    {
        return response()->stream(fn () => $syndication->sitemap(), 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
