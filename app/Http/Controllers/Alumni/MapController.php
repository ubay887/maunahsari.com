<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\MapQueryRequest;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Services\AlumniMap;
use App\Services\AlumniOptions;
use App\Services\AlumniPrivacy;
use App\Services\AlumniQuery;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function index(MapQueryRequest $request, #[CurrentUser] ?User $user, AlumniMap $map, AlumniPrivacy $privacy, AlumniOptions $options, AlumniQuery $query): Response
    {
        $member = $request->routeIs('alumni.map');
        $filters = $request->validated();
        $aggregate = $map->get($filters);
        $members = null;
        if ($member && $user !== null && isset($filters['region_id'], $filters['region_level'])) {
            $group = collect($aggregate['groups'])->first(fn (array $group): bool => $group['id'] === (int) $filters['region_id'] && $group['level'] === $filters['region_level'] && $group['count'] !== null);
            if ($group) {
                $members = $query->apply($privacy->discoverable()->with(['province', 'regency', 'program']), $filters, true)->where($group['level'] === 'regency' ? 'regency_id' : 'province_id', $group['id'])->orderBy('id')->paginate(12)->through(fn (AlumniProfile $profile): array => $privacy->profile($profile, $user));
            }
        }

        return Inertia::render($member ? 'alumni/map' : 'public/alumni-map', ['aggregate' => $aggregate, 'members' => $members, 'angkatanOptions' => $map->angkatanOptions(), 'filters' => $filters, 'member' => $member, 'tiles' => ['url' => config('alumni.tile_url'), 'dark_url' => config('alumni.tile_dark_url'), 'attribution' => config('alumni.tile_attribution')], ...$options->get()]);
    }

    public function show(MapQueryRequest $request, AlumniMap $map): JsonResponse
    {
        return response()->json($map->get($request->validated()))->header('Cache-Control', 'no-store');
    }
}
