<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Santri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SantriController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Santri::class);

        return Inertia::render('admin/santri/index', ['santris' => Santri::with(['program:id,name', 'applicant:id,registration_number', 'city:code,name'])->orderByDesc('id')->paginate(in_array($request->integer('per_page'), [10, 25, 50], true) ? $request->integer('per_page') : 10)->withQueryString()]);
    }

    public function show(Santri $santri): Response
    {
        Gate::authorize('view', $santri);

        return Inertia::render('admin/santri/show', ['santri' => $santri->load(['program', 'province', 'city', 'district', 'village']), 'hasPhoto' => $santri->photo_path !== null]);
    }

    public function photo(Santri $santri): StreamedResponse
    {
        Gate::authorize('view', $santri);
        abort_if($santri->photo_path === null || ! Storage::disk('local')->exists($santri->photo_path), 404);

        return Storage::disk('local')->response($santri->photo_path, null, ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
