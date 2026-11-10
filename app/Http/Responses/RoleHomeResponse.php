<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse;

class RoleHomeResponse implements LoginResponse, RegisterResponse, TwoFactorLoginResponse
{
    public function toResponse(mixed $request): RedirectResponse|JsonResponse
    {
        $request->session()->forget('url.intended');

        if ($request->wantsJson()) {
            return $request->routeIs('register.store') ? response()->json('', 201) : ($request->routeIs('two-factor.login.store') ? response()->json('', 204) : response()->json(['two_factor' => false]));
        }

        return redirect()->route($request->user()?->homeRouteName() ?? 'home');
    }
}
