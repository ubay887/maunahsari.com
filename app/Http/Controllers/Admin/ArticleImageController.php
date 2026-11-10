<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleImageRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ArticleImageController extends Controller
{
    public function __invoke(ArticleImageRequest $request): JsonResponse
    {
        $image = $request->file('image');
        abort_unless($image !== null, 422);
        $path = $image->store('articles/content', 'public');
        abort_unless(is_string($path), 500);

        return response()->json(['url' => Storage::disk('public')->url($path)], 201);
    }
}
