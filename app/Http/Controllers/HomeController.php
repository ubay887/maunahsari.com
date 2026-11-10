<?php

namespace App\Http\Controllers;

use App\Models\AlumniProfile;
use App\Models\Article;
use App\Services\PsbData;
use App\VerificationStatus;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(PsbData $psb): Response
    {
        $period = $psb->activePeriod();

        return Inertia::render('welcome', [
            'articles' => Article::published()
                ->with(['author:id,name', 'categories:id,name,slug'])
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->limit(6)
                ->get(),
            'alumniCount' => AlumniProfile::where('verification_status', VerificationStatus::Approved)->count(),
            'canonical' => route('home'),
            'period' => $period?->only(['id', 'name', 'academic_year', 'closes_at']),
        ]);
    }
}
