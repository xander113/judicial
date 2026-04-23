<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [App\Http\Controllers\HorseController::class, 'index'])->name('home')->middleware('banned');
Route::get('/horses/{horse:slug}', [App\Http\Controllers\HorseController::class, 'show'])->name('horses.show')->middleware('banned');

// ── Authenticated (any verified, non-banned user) ─────────────────────────────
Route::middleware(['auth', 'banned'])->group(function () {
    // Ratings — create or update; one per user per horse
    Route::post('/horses/{horse}/rate', [App\Http\Controllers\RatingController::class, 'store'])->name('ratings.store');

    // Comments
    Route::post('/horses/{horse}/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');

    // Ban appeal (for the banned user — note: CheckBanned middleware renders the banned page
    // but allows this POST through)
    Route::post('/appeals', [App\Http\Controllers\BanAppealController::class, 'store'])->name('appeals.store');
});

// ── Admin Panel (moderator + admin) ──────────────────────────────────────────
Route::middleware(['auth', 'role:moderator'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\PanelController::class, 'index'])->name('panel');

        // Comments — delete any comment
        Route::delete('/comments/{comment}', [App\Http\Controllers\Admin\CommentController::class, 'destroy'])->name('comments.destroy');

        // Blacklist
        Route::get('/blacklist', [App\Http\Controllers\Admin\BlacklistController::class, 'index'])->name('blacklist.index');
        Route::post('/blacklist', [App\Http\Controllers\Admin\BlacklistController::class, 'store'])->name('blacklist.store');
        Route::delete('/blacklist/{blacklistWord}', [App\Http\Controllers\Admin\BlacklistController::class, 'destroy'])->name('blacklist.destroy');

        // Horse locking
        Route::patch('/horses/{horse}/lock', [App\Http\Controllers\Admin\HorseLockController::class, 'lock'])->name('horses.lock');
        Route::patch('/horses/{horse}/unlock', [App\Http\Controllers\Admin\HorseLockController::class, 'unlock'])->name('horses.unlock');

        // Bans — mods can create, admins can also override
        Route::get('/bans', [App\Http\Controllers\Admin\BanController::class, 'index'])->name('bans.index');
        Route::post('/bans', [App\Http\Controllers\Admin\BanController::class, 'store'])->name('bans.store');

        // Appeals — view
        Route::get('/appeals', [App\Http\Controllers\Admin\BanAppealController::class, 'index'])->name('appeals.index');
    });

// ── Admin only ────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Ban override
        Route::patch('/bans/{ban}/override', [App\Http\Controllers\Admin\BanController::class, 'override'])->name('bans.override');

        // Appeal decisions
        Route::patch('/appeals/{banAppeal}', [App\Http\Controllers\Admin\BanAppealController::class, 'update'])->name('appeals.update');

        // Moderator management
        Route::get('/moderators', [App\Http\Controllers\Admin\ModeratorController::class, 'index'])->name('moderators.index');
        Route::post('/moderators', [App\Http\Controllers\Admin\ModeratorController::class, 'store'])->name('moderators.store');
        Route::delete('/moderators/{user}', [App\Http\Controllers\Admin\ModeratorController::class, 'destroy'])->name('moderators.destroy');
    });

Route::get('/login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])->name("login");

Route::get('/register', [App\Http\Controllers\Auth\RegisteredUserController::class, 'create'])->name("register");

Route::post('/auth/login', [App\Http\Controllers\SessionController::class, 'loginRequest'])->name("loginRequest");

Route::post('/auth/register', [App\Http\Controllers\SessionController::class, 'registerRequest'])->name("registerRequest");

Route::get('/api/logout', [App\Http\Controllers\AuthController::class, 'logout'])->name("logoutRequest");

// 404 error || KEEP AT BOTTOM!!

Route::any('{catchall}', [App\Http\Controllers\Controller::class, 'efof'])->where('catchall', '.*');