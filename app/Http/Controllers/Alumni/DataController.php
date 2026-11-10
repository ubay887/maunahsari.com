<?php

namespace App\Http\Controllers\Alumni;

use App\Actions\Alumni\DeleteAccount;
use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\DeleteAccountRequest;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\AlumniPrivacy;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('alumni/data');
    }

    public function show(#[CurrentUser] User $user, AlumniPrivacy $privacy): StreamedResponse
    {
        $data = $privacy->export($user);
        AuditLog::create(['actor_id' => $user->id, 'action' => 'data.exported', 'subject_type' => 'own_account']);

        return response()->streamDownload(function () use ($data): void {
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        }, 'data-alumni.json', ['Content-Type' => 'application/json', 'Cache-Control' => 'private, no-store']);
    }

    public function destroy(DeleteAccountRequest $request, #[CurrentUser] User $user, DeleteAccount $delete): RedirectResponse
    {
        Auth::logout();
        $delete->handle($user);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
