<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProgramRequest;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Program::class);

        return Inertia::render('admin/psb/programs/index', ['programs' => Program::orderBy('sort_order')->orderBy('id')->get()]);
    }

    public function store(ProgramRequest $request): RedirectResponse
    {
        Program::create($request->validated());

        return back()->with('success', 'Program berhasil dibuat.');
    }

    public function update(ProgramRequest $request, Program $program): RedirectResponse
    {
        Gate::authorize('update', $program);
        $program->update($request->validated());

        return back()->with('success', 'Program diperbarui.');
    }

    public function destroy(Program $program): RedirectResponse
    {
        Gate::authorize('delete', $program);
        if ($program->quotas()->exists() || $program->applicants()->withTrashed()->exists()) {
            throw ValidationException::withMessages(['program' => 'Program telah digunakan. Nonaktifkan program ini.']);
        }
        $program->delete();

        return back()->with('success', 'Program dihapus.');
    }
}
