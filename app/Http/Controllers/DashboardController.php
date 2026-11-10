<?php

namespace App\Http\Controllers;

use App\ApplicantStatus;
use App\ArticleStatus;
use App\Models\AlumniProfile;
use App\Models\Applicant;
use App\Models\Article;
use App\Models\Event;
use App\Models\Santri;
use App\Models\User;
use App\Services\DashboardFeeds;
use App\Services\PsbData;
use App\VerificationStatus;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(#[CurrentUser] User $user, PsbData $data, DashboardFeeds $feeds): Response
    {
        $canManagePsb = $user->can('viewAny', Applicant::class);
        $canWriteArticles = $user->can('viewAny', Article::class);
        $canManageEvents = $user->can('viewAny', Event::class);
        $canReviewAlumni = $user->can('viewAny', AlumniProfile::class);
        $overview = fn (): array => [
            'feedPageSize' => DashboardFeeds::PAGE_SIZE,
            'psb' => $canManagePsb ? $this->admissions($data, $feeds) : null,
            'articles' => $canWriteArticles ? $this->publications($user) : null,
            'events' => $canManageEvents ? $feeds->events()['data'] : null,
            'alumni' => $canReviewAlumni ? $this->alumniQueue($feeds) : null,
        ];

        return Inertia::render('dashboard', [
            'overview' => $canManagePsb || $canWriteArticles || $canManageEvents || $canReviewAlumni
                ? Inertia::defer($overview, rescue: true)
                : $overview(),
        ]);
    }

    /** @return array<string, mixed> */
    private function admissions(PsbData $data, DashboardFeeds $feeds): array
    {
        $period = $feeds->period();
        $applicants = Applicant::query()->where('registration_period_id', $period?->id);
        $counts = (clone $applicants)->selectRaw('status, COUNT(*) AS total')->groupBy('status')->pluck('total', 'status');

        return [
            'period' => $period ? [...$period->only(['id', 'name', 'academic_year']), 'is_open' => $period->isCurrentlyOpen()] : null,
            'totalApplicants' => (int) $counts->sum(),
            'pendingApplicants' => (int) ($counts[ApplicantStatus::Registered->value] ?? 0),
            'acceptedApplicants' => (int) ($counts[ApplicantStatus::Accepted->value] ?? 0),
            'activeSantri' => Santri::where('is_active', true)->count(),
            'recentApplicants' => $feeds->applicants()['data'],
        ];
    }

    /** @return array{total: int, published: int, draft: int} */
    private function publications(User $user): array
    {
        $articles = Article::query();
        if (! $user->can('publish', Article::class)) {
            $articles->whereBelongsTo($user, 'author');
        }

        return [
            'total' => (clone $articles)->count(),
            'published' => (clone $articles)->published()->count(),
            'draft' => (clone $articles)->where('status', ArticleStatus::Draft)->count(),
        ];
    }

    /** @return array{total: int, pending: int, queue: array<int, array<string, mixed>>} */
    private function alumniQueue(DashboardFeeds $feeds): array
    {
        return [
            'total' => AlumniProfile::query()->count(),
            'pending' => AlumniProfile::query()->where('verification_status', VerificationStatus::Pending)->count(),
            'queue' => $feeds->alumni()['data'],
        ];
    }
}
