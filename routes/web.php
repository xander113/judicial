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

// ── Appeals — auth only, intentionally NO banned middleware ───────────────────
//
// Banned users must be able to reach this endpoint.
// CheckBanned whitelists appeals.store as a belt-and-suspenders guard,
// but the primary fix is keeping this route outside the banned group entirely.

Route::middleware(['auth'])
    ->post('/appeals', [App\Http\Controllers\BanAppealController::class, 'store'])
    ->name('appeals.store');

// ── Authenticated, non-banned ─────────────────────────────────────────────────

Route::middleware(['auth', 'banned'])->group(function () {
    Route::post('/horses/{horse}/rate', [App\Http\Controllers\RatingController::class, 'store'])
        ->name('ratings.store');

    Route::post('/horses/{horse}/comments', [App\Http\Controllers\CommentController::class, 'store'])
        ->name('comments.store');
});

// ── Admin panel — moderators + admins ─────────────────────────────────────────

Route::middleware(['auth', 'role:moderator'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\PanelController::class, 'index'])->name('panel');

        Route::delete('/comments/{comment}', [App\Http\Controllers\Admin\CommentController::class, 'destroy'])
            ->name('comments.destroy');

        Route::get('/blacklist', [App\Http\Controllers\Admin\BlacklistController::class, 'index'])->name('blacklist.index');
        Route::post('/blacklist', [App\Http\Controllers\Admin\BlacklistController::class, 'store'])->name('blacklist.store');
        Route::delete('/blacklist/{blacklistWord}', [App\Http\Controllers\Admin\BlacklistController::class, 'destroy'])
            ->name('blacklist.destroy');

        Route::patch('/horses/{horse}/lock', [App\Http\Controllers\Admin\HorseLockController::class, 'lock'])
            ->name('horses.lock');
        Route::patch('/horses/{horse}/unlock', [App\Http\Controllers\Admin\HorseLockController::class, 'unlock'])
            ->name('horses.unlock');

        Route::get('/bans', [App\Http\Controllers\Admin\BanController::class, 'index'])->name('bans.index');
        Route::post('/bans', [App\Http\Controllers\Admin\BanController::class, 'store'])->name('bans.store');

        Route::get('/appeals', [App\Http\Controllers\Admin\BanAppealController::class, 'index'])->name('appeals.index');
    });

// ── Admin only ────────────────────────────────────────────────────────────────

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Override deactivates any active ban regardless of type or reason.
        Route::patch('/bans/{ban}/override', [App\Http\Controllers\Admin\BanController::class, 'override'])
            ->name('bans.override');

        // Appeal decisions — only admins may approve or deny.
        Route::patch('/appeals/{banAppeal}', [App\Http\Controllers\Admin\BanAppealController::class, 'update'])
            ->name('appeals.update');

        Route::get('/moderators', [App\Http\Controllers\Admin\ModeratorController::class, 'index'])
            ->name('moderators.index');
        Route::post('/moderators', [App\Http\Controllers\Admin\ModeratorController::class, 'store'])
            ->name('moderators.store');
        Route::delete('/moderators/{user}', [App\Http\Controllers\Admin\ModeratorController::class, 'destroy'])
            ->name('moderators.destroy');
    });

Route::get('/login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])->name("login");

Route::get('/register', [App\Http\Controllers\Auth\RegisteredUserController::class, 'create'])->name("register");

Route::post('/auth/login', [App\Http\Controllers\SessionController::class, 'loginRequest'])->name("loginRequest");

Route::post('/auth/register', [App\Http\Controllers\SessionController::class, 'registerRequest'])->name("registerRequest");

Route::get('/api/logout', [App\Http\Controllers\AuthController::class, 'logout'])->name("logoutRequest");

// 404 error || KEEP AT BOTTOM!!

Route::any('{catchall}', [App\Http\Controllers\Controller::class, 'efof'])->where('catchall', '.*');