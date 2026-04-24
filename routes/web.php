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
Route::get('/horses/{horse:slug}', [App\Http\Controllers\HorseController::class, 'show'])->name('horses.show')->middleware("banned");

// User stats — public JSON endpoint for hover cards (cached per user, 5 min)
Route::get('/api/users/{user}/stats', [App\Http\Controllers\UserProfileController::class, 'stats'])->name('users.stats');

// ── Appeals — auth only, outside CheckBanned ──────────────────────────────────

Route::middleware(['auth', 'throttle:appeals'])
    ->post('/appeals', [App\Http\Controllers\BanAppealController::class, 'store'])
    ->name('appeals.store');

// ── Authenticated, non-banned ─────────────────────────────────────────────────

Route::middleware(['auth', 'banned'])->group(function () {
    Route::post('/horses/{horse}/rate', [App\Http\Controllers\RatingController::class, 'store'])
        ->middleware('throttle:ratings')
        ->name('ratings.store');

    Route::post('/horses/{horse}/comments', [App\Http\Controllers\CommentController::class, 'store'])
        ->middleware('throttle:comments')
        ->name('comments.store');

    // Votes on comments and replies (same controller — replies are just comments with parent_id)
    Route::post('/comments/{comment}/vote', [App\Http\Controllers\CommentVoteController::class, 'vote'])
        ->name('comments.vote');

    // Reports (throttled per hour to discourage abuse)
    Route::post('/comments/{comment}/report', [App\Http\Controllers\ReportController::class, 'store'])
        ->middleware('throttle:reports')
        ->name('comments.report');
});

// ── Admin panel — moderators + admins ────────────────────────────────────────

Route::middleware(['auth', 'role:moderator'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\PanelController::class, 'index'])->name('panel');

        Route::delete('/comments/{comment}', [\App\Http\Controllers\Admin\CommentController::class, 'destroy'])
            ->name('comments.destroy');

        // Sticky toggle — moderators and admins; max 3 per horse enforced in controller
        Route::patch('/comments/{comment}/sticky', [\App\Http\Controllers\Admin\CommentController::class, 'sticky'])
            ->name('comments.sticky');

        Route::get('/blacklist', [\App\Http\Controllers\Admin\BlacklistController::class, 'index'])->name('blacklist.index');
        Route::post('/blacklist', [\App\Http\Controllers\Admin\BlacklistController::class, 'store'])->name('blacklist.store');
        Route::delete('/blacklist/{blacklistWord}', [\App\Http\Controllers\Admin\BlacklistController::class, 'destroy'])
            ->name('blacklist.destroy');

        Route::patch('/horses/{horse}/lock', [\App\Http\Controllers\Admin\HorseLockController::class, 'lock'])
            ->name('horses.lock');
        Route::patch('/horses/{horse}/unlock', [\App\Http\Controllers\Admin\HorseLockController::class, 'unlock'])
            ->name('horses.unlock');

        Route::get('/bans', [\App\Http\Controllers\Admin\BanController::class, 'index'])->name('bans.index');
        Route::post('/bans', [\App\Http\Controllers\Admin\BanController::class, 'store'])->name('bans.store');

        Route::get('/appeals', [\App\Http\Controllers\Admin\BanAppealController::class, 'index'])->name('appeals.index');

        // Reports — combined view; dismiss clears open reports without deleting the comment
        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
        Route::patch('/reports/{comment}/dismiss', [\App\Http\Controllers\Admin\ReportController::class, 'dismiss'])
            ->name('reports.dismiss');
    });

// ── Admin only ────────────────────────────────────────────────────────────────

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::patch('/bans/{ban}/override', [\App\Http\Controllers\Admin\BanController::class, 'override'])
            ->name('bans.override');

        Route::patch('/appeals/{banAppeal}', [\App\Http\Controllers\Admin\BanAppealController::class, 'update'])
            ->name('appeals.update');

        Route::get('/moderators', [\App\Http\Controllers\Admin\ModeratorController::class, 'index'])
            ->name('moderators.index');
        Route::post('/moderators', [\App\Http\Controllers\Admin\ModeratorController::class, 'store'])
            ->name('moderators.store');
        Route::delete('/moderators/{user}', [\App\Http\Controllers\Admin\ModeratorController::class, 'destroy'])
            ->name('moderators.destroy');
    });

Route::get('/login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])->name("login");

Route::get('/register', [App\Http\Controllers\Auth\RegisteredUserController::class, 'create'])->name("register");

Route::post('/auth/login', [App\Http\Controllers\SessionController::class, 'loginRequest'])->name("loginRequest");

Route::post('/auth/register', [App\Http\Controllers\SessionController::class, 'registerRequest'])->name("registerRequest");

Route::get('/api/logout', [App\Http\Controllers\AuthController::class, 'logout'])->name("logoutRequest");

// 404 error || KEEP AT BOTTOM!!

Route::any('{catchall}', [App\Http\Controllers\Controller::class, 'efof'])->where('catchall', '.*');