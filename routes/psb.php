<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Psb;
use App\Http\Controllers\PsbController;
use App\Http\Controllers\PsbRegionController;
use App\Http\Controllers\PsbStatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('psb')->name('psb.')->group(function (): void {
    Route::get('/', [PsbController::class, 'index'])->name('index');
    Route::get('daftar', [PsbController::class, 'register'])->name('register');
    Route::get('wilayah', PsbRegionController::class)->name('regions');
    Route::post('daftar', [PsbController::class, 'store'])->middleware('throttle:psb-submit')->name('store');
    Route::get('bukti', [PsbController::class, 'success'])->name('success');
    Route::get('status', [PsbStatusController::class, 'index'])->name('status.index');
    Route::post('status', [PsbStatusController::class, 'store'])->middleware('throttle:psb-status')->name('status.store');
});
Route::middleware(['auth', 'verified', 'applicant.only'])->prefix('psb/portal')->name('psb.portal.')->group(function (): void {
    Route::get('/', [Psb\PortalController::class, 'index'])->name('home');
    Route::get('bukti', [Psb\PortalController::class, 'receipt'])->name('receipt');
    Route::get('data', [Psb\PortalProfileController::class, 'edit'])->name('profile.edit');
    Route::put('data', [Psb\PortalProfileController::class, 'update'])->middleware('throttle:psb-portal')->name('profile.update');
    Route::get('dokumen', [Psb\PortalDocumentController::class, 'index'])->name('documents.index');
    Route::post('dokumen', [Psb\PortalDocumentController::class, 'store'])->middleware('throttle:psb-portal')->name('documents.store');
    Route::get('dokumen/{document}', [Psb\PortalDocumentController::class, 'show'])->name('documents.show');
    Route::get('administrasi', [Psb\PortalPaymentController::class, 'index'])->name('payments.index');
});
Route::middleware(['auth', 'admin', 'verified'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('santri', [Admin\SantriController::class, 'index'])->name('santri.index');
    Route::get('santri/{santri}', [Admin\SantriController::class, 'show'])->name('santri.show');
    Route::get('santri/{santri}/photo', [Admin\SantriController::class, 'photo'])->name('santri.photo');
    Route::prefix('psb')->name('psb.')->group(function (): void {
        Route::get('/', Admin\PsbDashboardController::class)->name('dashboard');
        Route::post('periods/images', Admin\RegistrationPeriodImageController::class)->name('periods.images.store');
        Route::resource('periods', Admin\RegistrationPeriodController::class)->except('show')->parameters(['periods' => 'period']);
        Route::resource('programs', Admin\ProgramController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('quotas', [Admin\ProgramQuotaController::class, 'index'])->name('quotas.index');
        Route::post('quotas', [Admin\ProgramQuotaController::class, 'store'])->name('quotas.store');
        Route::get('applicants/export', [Admin\ApplicantController::class, 'export'])->name('applicants.export');
        Route::resource('applicants', Admin\ApplicantController::class);
        Route::patch('applicants/{applicant}/status', Admin\ApplicantStatusController::class)->name('applicants.status');
        Route::patch('applicants/{applicant}/visit', Admin\ApplicantVisitController::class)->name('applicants.visit');
        Route::post('applicants/{applicant}/payments', [Admin\ApplicantPaymentController::class, 'store'])->name('applicants.payments.store');
        Route::delete('applicants/{applicant}/payments/{payment}', [Admin\ApplicantPaymentController::class, 'destroy'])->name('applicants.payments.destroy');
        Route::post('applicants/{applicant}/documents', [Admin\ApplicantDocumentController::class, 'store'])->name('applicants.documents.store');
        Route::delete('applicants/{applicant}/documents/{document}', [Admin\ApplicantDocumentController::class, 'destroy'])->name('applicants.documents.destroy');
        Route::get('documents/{document}', [Admin\ApplicantDocumentController::class, 'show'])->name('documents.show');
        Route::patch('documents/{document}/verify', [Admin\ApplicantDocumentController::class, 'verify'])->name('documents.verify');
    });
});
