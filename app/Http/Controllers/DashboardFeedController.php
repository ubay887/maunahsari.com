<?php

namespace App\Http\Controllers;

use App\Models\AlumniProfile;
use App\Models\Applicant;
use App\Models\Event;
use App\Models\User;
use App\Services\DashboardFeeds;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardFeedController extends Controller
{
    public function __invoke(Request $request, #[CurrentUser] User $user, DashboardFeeds $feeds, string $feed): JsonResponse
    {
        $page = max(1, $request->integer('page', 1));

        return response()->json(match ($feed) {
            'applicants' => $user->can('viewAny', Applicant::class) ? $feeds->applicants($page) : abort(403),
            'events' => $user->can('viewAny', Event::class) ? $feeds->events($page) : abort(403),
            'alumni' => $user->can('viewAny', AlumniProfile::class) ? $feeds->alumni($page) : abort(403),
            default => abort(404),
        });
    }
}
