<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Psb\QuotaLock;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegistrationPeriodRequest;
use App\Models\RegistrationPeriod;
use App\Services\ArticleHtmlSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationPeriodController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', RegistrationPeriod::class);

        return Inertia::render('admin/psb/periods/index', ['periods' => RegistrationPeriod::orderByDesc('id')->get()]);
    }

    public function create(): Response
    {
        Gate::authorize('create', RegistrationPeriod::class);

        return Inertia::render('admin/psb/periods/create');
    }

    public function edit(RegistrationPeriod $period): Response
    {
        Gate::authorize('update', $period);

        return Inertia::render('admin/psb/periods/edit', ['period' => $period]);
    }

    public function store(RegistrationPeriodRequest $request, ArticleHtmlSanitizer $sanitizer): RedirectResponse
    {
        RegistrationPeriod::create([...$request->validated(), 'info_note' => $sanitizer->clean($request->string('info_note')->toString())]);

        return to_route('admin.psb.periods.index')->with('success', 'Periode berhasil dibuat.');
    }

    public function update(RegistrationPeriodRequest $request, RegistrationPeriod $period, QuotaLock $lock, ArticleHtmlSanitizer $sanitizer): RedirectResponse
    {
        Gate::authorize('update', $period);
        DB::transaction(fn () => $lock->period($period->id)->update([...$request->validated(), 'info_note' => $sanitizer->clean($request->string('info_note')->toString())]));

        return to_route('admin.psb.periods.index')->with('success', 'Periode berhasil diperbarui.');
    }

    public function destroy(RegistrationPeriod $period, QuotaLock $lock): RedirectResponse
    {
        Gate::authorize('delete', $period);
        DB::transaction(function () use ($period, $lock): void {
            $locked = $lock->period($period->id);
            if ($locked->applicants()->withTrashed()->exists()) {
                throw ValidationException::withMessages(['period' => 'Periode yang memiliki pendaftar tidak dapat dihapus. Tutup periode ini.']);
            }
            $locked->delete();
        });

        return back()->with('success', 'Periode dihapus.');
    }
}
