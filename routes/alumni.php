<?php

use App\Http\Controllers\Admin\AlumniClaimCodeController;
use App\Http\Controllers\Admin\AlumniController;
use App\Http\Controllers\Admin\AlumniImportController;
use App\Http\Controllers\Admin\AlumniStatisticsController;
use App\Http\Controllers\Admin\AlumniVerificationController;
use App\Http\Controllers\Alumni;
use Illuminate\Support\Facades\Route;

Route::get('alumni/sebaran', [Alumni\MapController::class, 'index'])->name('alumni.public-map');
Route::get('alumni/sebaran/data', [Alumni\MapController::class, 'show'])->name('alumni.map-data');
Route::get('alumni/kebijakan-privasi', Alumni\PrivacyPolicyController::class)->name('alumni.privacy-policy');
Route::middleware(['auth', 'verified'])->prefix('alumni')->name('alumni.')->group(function (): void {
    Route::get('foto/{profile}', Alumni\PhotoController::class)->name('photo');
    Route::middleware('alumni.only')->group(function (): void {
        Route::get('profil', [Alumni\ProfileController::class, 'edit'])->name('profile.edit');
        Route::post('profil', [Alumni\ProfileController::class, 'update'])->name('profile.update');
        Route::get('privasi', [Alumni\PrivacyController::class, 'edit'])->name('privacy.edit');
        Route::put('privasi', [Alumni\PrivacyController::class, 'update'])->name('privacy.update');
        Route::get('klaim', [Alumni\ClaimController::class, 'index'])->name('claim.index');
        Route::post('klaim', [Alumni\ClaimController::class, 'store'])->middleware('throttle:alumni-claim')->name('claim.store');
        Route::get('data-saya', [Alumni\DataController::class, 'index'])->name('data.index');
        Route::get('data-saya/unduh', [Alumni\DataController::class, 'show'])->name('data.show');
        Route::delete('data-saya', [Alumni\DataController::class, 'destroy'])->name('data.destroy');
        Route::middleware('alumni.approved')->group(function (): void {
            Route::get('radar', Alumni\RadarController::class)->name('radar');
            Route::get('peta', [Alumni\MapController::class, 'index'])->name('map');
            Route::get('direktori', Alumni\DirectoryController::class)->name('directory');
            Route::get('kontak', [Alumni\ContactController::class, 'index'])->name('contacts.index');
            Route::post('kontak/{profile}', [Alumni\ContactController::class, 'store'])->middleware('throttle:alumni-contact')->name('contacts.store');
            Route::put('permintaan-kontak/{contact}', [Alumni\ContactController::class, 'update'])->name('contacts.update');
            Route::get('permintaan-kontak/{contact}', [Alumni\ContactController::class, 'show'])->name('contacts.show');
        });
        Route::get('/', [Alumni\PortalController::class, 'index'])->name('home');
    });
});

Route::middleware(['auth', 'admin', 'verified'])->prefix('admin/alumni')->name('admin.alumni.')->group(function (): void {
    Route::get('statistik', AlumniStatisticsController::class)->name('statistics');
    Route::get('export', [AlumniController::class, 'export'])->name('export');
    Route::get('impor', [AlumniImportController::class, 'index'])->name('import.index');
    Route::get('impor/template', [AlumniImportController::class, 'template'])->name('import.template');
    Route::post('impor/pratinjau', [AlumniImportController::class, 'preview'])->middleware('throttle:10,1')->name('import.preview');
    Route::post('impor', [AlumniImportController::class, 'store'])->name('import.store');
    Route::post('kode-klaim/export', [AlumniClaimCodeController::class, 'export'])->name('claims.export');
    Route::post('{profile}/kode-klaim', [AlumniClaimCodeController::class, 'store'])->name('claims.store');
    Route::patch('{profile}/verifikasi', AlumniVerificationController::class)->name('verify');
    Route::get('/', [AlumniController::class, 'index'])->name('index');
    Route::get('buat', [AlumniController::class, 'create'])->name('create');
    Route::post('/', [AlumniController::class, 'store'])->name('store');
    Route::get('{profile}/edit', [AlumniController::class, 'edit'])->name('edit');
    Route::post('{profile}', [AlumniController::class, 'update'])->name('update');
    Route::delete('{profile}', [AlumniController::class, 'destroy'])->name('destroy');
    Route::get('{profile}', [AlumniController::class, 'show'])->whereNumber('profile')->name('show');
});
