<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApprovedAlumni
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->can('browse-alumni') ?? false, 403, 'Lengkapi profil dan pilihan privasi, lalu tunggu persetujuan pengurus.');

        return $next($request);
    }
}
