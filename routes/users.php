<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserPasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->prefix('admin/pengguna')->name('admin.users.')->group(function (): void {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::patch('{user}', [UserController::class, 'update'])->whereNumber('user')->name('update');
    Route::post('{user}/kata-sandi', UserPasswordController::class)->whereNumber('user')->name('password.reset');
    Route::delete('{user}', [UserController::class, 'destroy'])->whereNumber('user')->name('destroy');
});
