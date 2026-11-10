<?php

namespace App\Http\Controllers;

use App\Http\Requests\PsbRegionRequest;
use App\Services\PsbFormData;
use Illuminate\Http\JsonResponse;

class PsbRegionController extends Controller
{
    public function __invoke(PsbRegionRequest $request, PsbFormData $data): JsonResponse
    {
        return response()->json(['options' => $data->regions($request->string('level')->toString(), $request->string('parent_code')->toString())]);
    }
}
