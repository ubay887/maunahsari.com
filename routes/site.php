<?php

use App\Http\Controllers\Admin\SiteContentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('site', [SiteContentController::class, 'index'])->name('site.index');
    Route::get('site/{page}/edit', [SiteContentController::class, 'edit'])->name('site.edit');
    Route::put('site/{page}', [SiteContentController::class, 'update'])->name('site.update');
});
