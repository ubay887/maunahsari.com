<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Passkeys\Contracts\PasskeyLoginResponse;

class RolePasskeyResponse implements PasskeyLoginResponse
{
    /** @param Request $request */
    public function toResponse(mixed $request): JsonResponse|RedirectResponse
    {
        $request->session()->forget('url.intended');
        $url = route($request->user()?->homeRouteName() ?? 'home');

        return $request->wantsJson() ? response()->json(['redirect' => $url]) : redirect()->to($url);
    }
}
