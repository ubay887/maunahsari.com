<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\QueryRequest;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Services\AlumniOptions;
use App\Services\AlumniPrivacy;
use App\Services\AlumniQuery;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\Inertia;
use Inertia\Response;

class DirectoryController extends Controller
{
    public function __invoke(QueryRequest $request, #[CurrentUser] User $user, AlumniPrivacy $privacy, AlumniOptions $options, AlumniQuery $query): Response
    {
        $profiles = $query->apply($privacy->discoverable()->with(['province', 'regency', 'program']), $request->validated(), true)->orderBy('id')->paginate(12)->withQueryString()->through(fn (AlumniProfile $profile): array => $privacy->profile($profile, $user));

        return Inertia::render('alumni/directory', ['profiles' => $profiles, 'filters' => $request->validated(), ...$options->get()]);
    }
}
