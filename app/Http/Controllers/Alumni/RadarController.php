<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\RadarRequest;
use App\Models\Regency;
use App\Models\User;
use App\Services\AlumniOptions;
use App\Services\AlumniRadar;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\Inertia;
use Inertia\Response;

class RadarController extends Controller
{
    public function __invoke(RadarRequest $request, #[CurrentUser] User $user, AlumniRadar $radar, AlumniOptions $options): Response
    {
        $center = Regency::findOrFail($request->integer('regency_id', $user->alumniProfile()->firstOrFail()->regency_id));
        $radius = $request->integer('radius', 25);

        return Inertia::render('alumni/radar', ['profiles' => $radar->search($user, $center, $radius, $request->validated()), 'filters' => [...$request->validated(), 'regency_id' => (string) $center->id, 'radius' => (string) $radius], 'coordinatesAvailable' => $center->latitude !== null && $center->longitude !== null, ...$options->get()]);
    }
}
