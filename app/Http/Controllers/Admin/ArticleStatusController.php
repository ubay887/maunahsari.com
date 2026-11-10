<?php

namespace App\Http\Controllers\Admin;

use App\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleStatusRequest;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;

class ArticleStatusController extends Controller
{
    public function __invoke(ArticleStatusRequest $request, Article $article): RedirectResponse
    {
        $status = ArticleStatus::from($request->string('status')->toString());
        $article->update(['status' => $status, 'published_at' => $status === ArticleStatus::Published ? now() : $article->published_at]);

        return back()->with('success', 'Status artikel diperbarui.');
    }
}
