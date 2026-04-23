<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $ban = Auth::user()->getActiveBan();

            if ($ban) {
                // Whitelisted: the banned splash, logout, and the appeal POST itself.
                // Everything else is blocked so the Banned page is rendered instead.
                if (
                    ! $request->routeIs('banned')
                    && ! $request->routeIs('logout')
                    && ! $request->routeIs('appeals.store')
                ) {
                    return Inertia::render('Banned', [
                        'ban' => [
                            'reason'     => $ban->reason,
                            'type'       => $ban->type,
                            'expires_at' => $ban->expires_at?->toISOString(),
                            'has_appeal' => $ban->appeal()->exists(),
                        ],
                    ])->toResponse($request)->setStatusCode(403);
                }
            }
        }

        return $next($request);
    }
}
