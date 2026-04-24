<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserProfileController extends Controller
{
    /**
     * Returns lightweight user stats for the hover card.
     * Cached per user for 5 minutes to handle high-traffic hover events.
     */
    public function stats(User $user): JsonResponse
    {
        $cacheKey = "user.stats.{$user->id}";

        $data = cache()->remember($cacheKey, 300, function () use ($user) {
            $ratings = $user->ratings()->get();

            if ($ratings->isEmpty()) {
                return [
                    'avg'            => null,
                    'highest'        => null,
                    'lowest'         => null,
                    'is_critic'      => false,
                    'ratings_count'  => 0,
                    'comments_count' => 0,
                ];
            }

            $effValues = $ratings->map(fn ($r) => $r->effectiveValue());
            $highest   = $ratings->sortByDesc(fn ($r) => $r->effectiveValue())->first();
            $lowest    = $ratings->sortBy(fn ($r) => $r->effectiveValue())->first();

            $commentsCount = Comment::where('user_id', $user->id)->whereNull('deleted_at')->count();

            return [
                'avg'    => round($effValues->avg(), 2),
                'highest' => ['value' => $highest->value, 'intensity' => $highest->intensity],
                'lowest'  => ['value' => $lowest->value,  'intensity' => $lowest->intensity],
                'is_critic'      => $ratings->count() >= 25 && $commentsCount >= 10,
                'ratings_count'  => $ratings->count(),
                'comments_count' => $commentsCount,
            ];
        });

        return response()->json($data);
    }
}
