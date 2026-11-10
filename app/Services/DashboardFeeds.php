<?php

namespace App\Services;

use App\EventStatus;
use App\Models\AlumniProfile;
use App\Models\Applicant;
use App\Models\Event;
use App\Models\RegistrationPeriod;
use App\VerificationStatus;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Daftar bertahap untuk kartu dashboard. Tiap daftar dibatasi ke
 * {@see self::MAX_ITEMS} data terbaru supaya panjang kartu tetap seragam.
 */
class DashboardFeeds
{
    public const PAGE_SIZE = 8;

    public const MAX_ITEMS = 40;

    public function __construct(private PsbData $data) {}

    public function period(): ?RegistrationPeriod
    {
        return $this->data->activePeriod() ?? RegistrationPeriod::latest('id')->first();
    }

    /** @return array{data: array<int, array<string, mixed>>, next_page: int|null} */
    public function applicants(int $page = 1): array
    {
        $query = Applicant::query()
            ->where('registration_period_id', $this->period()?->id)
            ->with('program:id,name')
            ->select(['id', 'registration_number', 'full_name', 'program_id', 'status', 'created_at'])
            ->latest('id');

        return $this->page($query, $page, fn (Applicant $applicant): array => [
            'id' => $applicant->id,
            'registration_number' => $applicant->registration_number,
            'full_name' => $applicant->full_name,
            'program_name' => $applicant->program->name,
            'status' => $applicant->status->value,
            'created_at' => $applicant->created_at?->toIso8601String(),
        ]);
    }

    /** @return array{data: array<int, array<string, mixed>>, next_page: int|null} */
    public function events(int $page = 1): array
    {
        $query = Event::query()
            ->where('status', EventStatus::Published)
            ->upcoming()
            ->select(['id', 'title', 'start_at', 'end_at', 'type'])
            ->orderBy('start_at')
            ->orderBy('id');

        return $this->page($query, $page, fn (Event $event): array => [
            'id' => $event->id,
            'title' => $event->title,
            'start_at' => $event->start_at->toIso8601String(),
            'type' => $event->type->value,
            'phase' => $event->phase,
        ]);
    }

    /** @return array{data: array<int, array<string, mixed>>, next_page: int|null} */
    public function alumni(int $page = 1): array
    {
        $query = AlumniProfile::query()
            ->where('verification_status', VerificationStatus::Pending)
            ->select(['id', 'full_name', 'angkatan', 'created_at'])
            ->oldest('id');

        return $this->page($query, $page, fn (AlumniProfile $profile): array => [
            'id' => $profile->id,
            'full_name' => $profile->full_name,
            'angkatan' => $profile->angkatan,
            'created_at' => $profile->created_at?->toIso8601String(),
        ]);
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  Closure(TModel): array<string, mixed>  $map
     * @return array{data: array<int, array<string, mixed>>, next_page: int|null}
     */
    private function page(Builder $query, int $page, Closure $map): array
    {
        $page = max(1, $page);

        if (($page - 1) * self::PAGE_SIZE >= self::MAX_ITEMS) {
            return ['data' => [], 'next_page' => null];
        }

        $rows = $query->offset(($page - 1) * self::PAGE_SIZE)->limit(self::PAGE_SIZE + 1)->get();
        $hasMore = $rows->count() > self::PAGE_SIZE && $page * self::PAGE_SIZE < self::MAX_ITEMS;

        return [
            'data' => $rows->take(self::PAGE_SIZE)->map($map)->values()->all(),
            'next_page' => $hasMore ? $page + 1 : null,
        ];
    }
}
