<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Member routes
    Route::prefix('members')->name('members.')->group(function () {
        Route::get('/', fn() => Inertia::render('Members/Index'))->name('index');
        Route::get('/create', fn() => Inertia::render('Members/Create'))->name('create');
        Route::get('/{member}', fn() => Inertia::render('Members/Show'))->name('show');
        Route::get('/{member}/edit', fn() => Inertia::render('Members/Edit'))->name('edit');
    });

    // Subscription routes
    Route::prefix('subscriptions')->name('subscriptions.')->group(function () {
        Route::get('/', fn() => Inertia::render('Subscriptions/Index'))->name('index');
        Route::get('/create', fn() => Inertia::render('Subscriptions/Create'))->name('create');
    });

    // Attendance routes
    Route::prefix('attendance')->name('attendance.')->group(function () {
        Route::get('/', fn() => Inertia::render('Attendance/Index'))->name('index');
    });

    // Class routes
    Route::prefix('classes')->name('classes.')->group(function () {
        Route::get('/', fn() => Inertia::render('Classes/Index'))->name('index');
        Route::get('/schedule', fn() => Inertia::render('Classes/Schedule'))->name('schedule');
        Route::get('/bookings', fn() => Inertia::render('Classes/Bookings'))->name('bookings');
    });

    // Finance routes
    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/', fn() => Inertia::render('Finance/Invoices'))->name('index');
    });

    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', fn() => Inertia::render('Finance/Payments'))->name('index');
    });

    // POS routes
    Route::prefix('pos')->name('pos.')->group(function () {
        Route::get('/', fn() => Inertia::render('POS/Index'))->name('index');
    });

    // Reports routes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', fn() => Inertia::render('Reports/Index'))->name('index');
    });

    // Settings routes
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', fn() => Inertia::render('Settings/Index'))->name('index');
    });

    // Activity Logs routes
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', [App\Http\Controllers\ActivityLogController::class, 'index'])->name('index');
        Route::get('/{activity}', [App\Http\Controllers\ActivityLogController::class, 'show'])->name('show');
    });
});

require __DIR__.'/auth.php';
