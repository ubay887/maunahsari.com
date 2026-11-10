<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Alumni\DeleteProfile;
use App\Actions\Alumni\SaveAdminProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\AdminProfileRequest;
use App\Http\Requests\Alumni\QueryRequest;
use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\Santri;
use App\Models\User;
use App\Services\AlumniOptions;
use App\Services\AlumniPrivacy;
use App\Services\AlumniQuery;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AlumniController extends Controller
{
    public function index(QueryRequest $request, #[CurrentUser] User $admin, AlumniPrivacy $privacy, AlumniOptions $options, AlumniQuery $query): Response
    {
        Gate::authorize('viewAny', AlumniProfile::class);
        $filters = $request->validated();
        $profiles = $query->apply(AlumniProfile::with(['province', 'regency', 'program']), $filters)->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')->orderBy('id')->paginate($request->integer('per_page', 10))->withQueryString()->through(fn (AlumniProfile $profile): array => $privacy->summary($profile, $admin));

        return Inertia::render('admin/alumni/index', ['profiles' => $profiles, 'filters' => $filters, ...$options->get()]);
    }

    public function show(#[CurrentUser] User $admin, AlumniProfile $profile, AlumniPrivacy $privacy): Response
    {
        $profile->loadMissing(['user:id,name,email', 'santri:id,full_name', 'verifier:id,name']);

        return Inertia::render('admin/alumni/show', [
            'profile' => $privacy->profile($profile, $admin),
            'account' => $profile->user?->only(['id', 'name', 'email']),
            'santri' => $profile->santri?->only(['id', 'full_name']),
            'verifiedBy' => $profile->verifier?->name,
        ]);
    }

    public function create(AlumniOptions $options): Response
    {
        Gate::authorize('create', AlumniProfile::class);

        return Inertia::render('admin/alumni/form', ['profile' => null, ...$options->get()]);
    }

    public function store(AdminProfileRequest $request, SaveAdminProfile $save): RedirectResponse
    {
        $profile = $save->handle($request->validated(), photo: $request->file('photo'));

        return redirect()->route('admin.alumni.edit', $profile)->with('success', 'Profil tersimpan.');
    }

    public function edit(#[CurrentUser] User $admin, AlumniProfile $profile, AlumniPrivacy $privacy, AlumniOptions $options): Response
    {
        Gate::authorize('update', $profile);

        return Inertia::render('admin/alumni/form', ['profile' => $privacy->profile($profile, $admin), 'santriCandidates' => Santri::where('full_name', 'like', '%'.$profile->full_name.'%')->limit(10)->get(['id', 'full_name', 'entry_year'])->toArray(), ...$options->get()]);
    }

    public function update(AdminProfileRequest $request, AlumniProfile $profile, SaveAdminProfile $save): RedirectResponse
    {
        Gate::authorize('update', $profile);
        $save->handle($request->validated(), $profile, $request->file('photo'));

        return back()->with('success', 'Profil diperbarui.');
    }

    public function destroy(AlumniProfile $profile, #[CurrentUser] User $admin, DeleteProfile $delete): RedirectResponse
    {
        Gate::authorize('delete', $profile);
        $delete->handle($profile, $admin);

        return redirect()->route('admin.alumni.index')->with('success', 'Profil dihapus permanen.');
    }

    public function export(QueryRequest $request, #[CurrentUser] User $admin, AlumniQuery $query, AlumniPrivacy $privacy): StreamedResponse
    {
        Gate::authorize('viewAny', AlumniProfile::class);
        AuditLog::create(['actor_id' => $admin->id, 'action' => 'alumni.exported', 'subject_type' => 'alumni_profile']);
        $profiles = $query->apply(AlumniProfile::with(['province', 'regency', 'program']), $request->validated());

        return response()->streamDownload(function () use ($profiles, $privacy, $admin): void {
            $file = fopen('php://output', 'w');
            if ($file === false) {
                return;
            }
            fputcsv($file, ['full_name', 'angkatan', 'pondok', 'alumni_status', 'province', 'regency', 'activity_status', 'profession', 'verification_status'], escape: '');
            foreach ($profiles->lazyById(100) as $profile) {
                $data = $privacy->profile($profile, $admin, false);
                $row = [];
                foreach (['full_name', 'angkatan', 'pondok', 'alumni_status', 'province', 'regency', 'activity_status', 'profession', 'verification_status'] as $key) {
                    $value = (string) ($data[$key] ?? '');
                    $row[] = preg_match('/^[\x00-\x20]*[=+@\-]/', $value) ? "'".$value : $value;
                }
                fputcsv($file, $row, escape: '');
            }
            fclose($file);
        }, 'alumni.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'private, no-store']);
    }
}
