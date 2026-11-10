<?php

namespace App\Http\Middleware;

use App\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Portal calon santri hanya untuk akun ber-role applicant; staf diarahkan ke administrasi PSB. */
class EnsureUserIsApplicant
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role === UserRole::Applicant) {
            return $next($request);
        }
        if ($request->user()?->canAccessAdminPanel() && $request->isMethodSafe() && ! $request->expectsJson()) {
            return redirect()->route('admin.psb.dashboard');
        }

        abort(403);
    }
}
