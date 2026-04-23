<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    /**
     * Usage in routes: middleware('role:admin') or middleware('role:moderator')
     * Accepts 'admin' (admin only) or 'moderator' (moderator OR admin).
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $allowed = match ($role) {
            'admin'     => $user->isAdmin(),
            'moderator' => $user->isAdminOrModerator(),
            default     => false,
        };

        if (! $allowed) {
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}