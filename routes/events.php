<?php

use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\EventDuplicateController;
use App\Http\Controllers\Admin\EventStatusController;
use App\Http\Controllers\EventCalendarController;
use Illuminate\Support\Facades\Route;

Route::get('events', [App\Http\Controllers\EventController::class, 'index'])->name('events.index');
Route::get('events/{event:slug}.ics', EventCalendarController::class)->name('events.calendar');
Route::get('events/{event:slug}', [App\Http\Controllers\EventController::class, 'show'])->name('events.show');

Route::middleware(['auth', 'admin', 'verified'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::patch('events/{event}/status', EventStatusController::class)->name('events.status.update');
    Route::post('events/{event}/duplicate', EventDuplicateController::class)->name('events.duplicate');
    Route::resource('events', EventController::class);
});
