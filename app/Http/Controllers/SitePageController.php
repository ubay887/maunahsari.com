<?php

namespace App\Http\Controllers;

use App\Services\SiteContent;
use App\SitePageKey;
use Inertia\Inertia;
use Inertia\Response;

class SitePageController extends Controller
{
    public function profile(SiteContent $content): Response
    {
        return Inertia::render('site/profil', ['content' => $content->get(SitePageKey::Profile), 'canonical' => route('site.profile')]);
    }

    public function pondok(string $pondok, SiteContent $content): Response
    {
        abort_unless(in_array($pondok, ['putra', 'putri'], true), 404);

        return Inertia::render('site/pondok', [
            'pondok' => $pondok,
            'content' => $content->get($pondok === 'putra' ? SitePageKey::PondokPutra : SitePageKey::PondokPutri),
            'canonical' => route('site.pondok.'.$pondok),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('site/narahubung', ['canonical' => route('site.contact')]);
    }
}
