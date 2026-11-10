<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetRoleRedirects
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            config(['fortify.home' => route($request->user()->homeRouteName(), absolute: false)]);
        }

        return $next($request);
    }
}
