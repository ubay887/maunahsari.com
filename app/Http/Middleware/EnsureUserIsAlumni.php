<?php

namespace App\Http\Middleware;

use App\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Portal alumni hanya untuk akun ber-role alumni; staf diarahkan ke administrasi alumni. */
class EnsureUserIsAlumni
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role === UserRole::Alumni) {
            return $next($request);
        }
        if ($request->user()?->canAccessAdminPanel() && $request->isMethodSafe() && ! $request->expectsJson()) {
            return redirect()->route('admin.alumni.index');
        }

        abort(403);
    }
}
