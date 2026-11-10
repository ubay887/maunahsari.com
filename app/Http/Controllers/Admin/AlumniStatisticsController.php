<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Services\AlumniStatistics;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AlumniStatisticsController extends Controller
{
    public function __invoke(AlumniStatistics $statistics): Response
    {
        Gate::authorize('viewAny', AlumniProfile::class);

        return Inertia::render('admin/alumni/statistics', ['statistics' => $statistics->get()]);
    }
}
