<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Rating;
use App\Observers\CommentObserver;
use App\Observers\RatingObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Rating::observe(RatingObserver::class);
        Comment::observe(CommentObserver::class);

        RateLimiter::for('comments', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => back()->withErrors(['body' => 'You are posting too quickly. Please wait before commenting again.']));
        });

        RateLimiter::for('ratings', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => back()->withErrors(['value' => 'You are rating too quickly. Please wait a moment.']));
        });

        RateLimiter::for('appeals', function (Request $request) {
            return Limit::perMinute(3)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => back()->withErrors(['message' => 'Too many appeal attempts. Please wait before trying again.']));
        });

        RateLimiter::for('reports', function (Request $request) {
            return Limit::perHour(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => back()->withErrors(['reason' => 'You have submitted too many reports recently. Please wait before reporting again.']));
        });
    }
}
