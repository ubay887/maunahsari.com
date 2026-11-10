<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\ArticleImageController;
use App\Http\Controllers\Admin\ArticleStatusController;
use App\Http\Controllers\Admin\TaxonomyController;
use App\Http\Controllers\ArticleSyndicationController;
use Illuminate\Support\Facades\Route;

Route::get('artikel/feed', [ArticleSyndicationController::class, 'feed'])->name('articles.feed');
Route::get('sitemap.xml', [ArticleSyndicationController::class, 'sitemap'])->name('articles.sitemap');
Route::get('artikel', [App\Http\Controllers\ArticleController::class, 'index'])->name('articles.index');
Route::get('artikel/{article:slug}', [App\Http\Controllers\ArticleController::class, 'show'])->name('articles.show');

Route::middleware(['auth', 'admin', 'verified'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('articles/taxonomies', [TaxonomyController::class, 'index'])->name('taxonomies.index');
    Route::post('taxonomies/{taxonomy}', [TaxonomyController::class, 'store'])->whereIn('taxonomy', ['categories', 'tags'])->name('taxonomies.store');
    Route::put('taxonomies/{taxonomy}/{id}', [TaxonomyController::class, 'update'])->whereIn('taxonomy', ['categories', 'tags'])->whereNumber('id')->name('taxonomies.update');
    Route::delete('taxonomies/{taxonomy}/{id}', [TaxonomyController::class, 'destroy'])->whereIn('taxonomy', ['categories', 'tags'])->whereNumber('id')->name('taxonomies.destroy');
    Route::post('articles/images', ArticleImageController::class)->middleware('throttle:30,1')->name('articles.images.store');
    Route::patch('articles/{article}/status', ArticleStatusController::class)->name('articles.status.update');
    Route::resource('articles', ArticleController::class);
});
