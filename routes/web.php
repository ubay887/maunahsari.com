<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardFeedController;
use App\Http\Controllers\DataGridShowcaseController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SitePageController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('profil', [SitePageController::class, 'profile'])->name('site.profile');
Route::get('pondok/putra', [SitePageController::class, 'pondok'])->defaults('pondok', 'putra')->name('site.pondok.putra');
Route::get('pondok/putri', [SitePageController::class, 'pondok'])->defaults('pondok', 'putri')->name('site.pondok.putri');
Route::get('narahubung', [SitePageController::class, 'contact'])->name('site.contact');

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('dashboard/feeds/{feed}', DashboardFeedController::class)->name('dashboard.feed');
    Route::get('showcase/data-grid', DataGridShowcaseController::class)->name('showcase.data-grid');
});

require __DIR__.'/settings.php';
require __DIR__.'/articles.php';
require __DIR__.'/events.php';
require __DIR__.'/site.php';
require __DIR__.'/users.php';

require __DIR__.'/psb.php';

require __DIR__.'/alumni.php';
