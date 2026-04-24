<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Horse;
use App\Models\Rating;
use App\Models\User;
use App\Services\CommentFilter;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HorseController extends Controller
{
    private const SORT_OPTIONS = ['popular', 'controversial', 'latest', 'oldest', 'highest_rated', 'lowest_rated'];

    // ── Index ─────────────────────────────────────────────────────────────────

    public function index(): Response
    {
        $all = Cache::remember('horses.index.raw', 120, function () {
            return Horse::with('ratings')->orderBy('episode')->orderBy('name')->get();
        });

        $shape = fn (Horse $h) => [
            'id'            => $h->id,
            'name'          => $h->name,
            'slug'          => $h->slug,
            'episode'       => $h->episode,
            'weight_lbs'    => $h->weight_lbs,
            'image_path'    => $h->image_path,
            'is_locked'     => $h->is_locked,
            'avg_rating'    => $h->averageEffectiveRating(),
            'tier'          => $h->tier(),
            'ratings_count' => $h->ratings->count(),
        ];

        $horses = $all->map($shape)->values();

        $weekAgo   = now()->subDays(7);
        $weeklyIds = Cache::remember('ratings.weekly_ids', 120, function () use ($weekAgo) {
            return Rating::where(function ($q) use ($weekAgo) {
                $q->where('created_at', '>=', $weekAgo)
                  ->orWhere('updated_at', '>=', $weekAgo);
            })->distinct()->pluck('horse_id');
        });

        $weeklyHorses   = $all->filter(fn ($h) => $weeklyIds->contains($h->id) && $h->averageEffectiveRating() !== null)->map($shape);
        $topThisWeek    = $weeklyHorses->sortByDesc('avg_rating')->values()->take(8);
        $lowestThisWeek = $weeklyHorses->sortBy('avg_rating')->values()->take(8);

        return Inertia::render('Horses/Index', compact('horses', 'topThisWeek', 'lowestThisWeek'));
    }

    // ── Show ──────────────────────────────────────────────────────────────────

    public function show(Horse $horse, Request $request, CommentFilter $filter): Response
    {
        $horse->loadMissing('ratings');
        $ratingsByUser = $horse->ratings->keyBy('user_id');
        $ratingData    = fn ($uid) => ($r = $ratingsByUser->get($uid))
            ? ['value' => $r->value, 'intensity' => $r->intensity]
            : null;

        $sortParam     = in_array($request->query('sort'), self::SORT_OPTIONS)
            ? $request->query('sort')
            : 'popular';
        $currentUserId = $request->user()?->id;

        $eagerLoads = [
            'user:id,name,role',
            'votes',
            'replies' => fn ($q) => $q->whereNull('deleted_at')->with(['user:id,name,role', 'votes']),
        ];

        // Sticky comments — always first, excluded from the paginated set.
        // Use whereRaw for boolean to remain compatible with both MySQL and PostgreSQL.
        $stickyRaw = Comment::where('horse_id', $horse->id)
            ->whereNull('parent_id')
            ->whereNull('deleted_at')
            ->whereRaw('is_sticky = true')
            ->with($eagerLoads)
            ->get();

        // Non-sticky paginated comments.
        $commentsQuery = Comment::where('horse_id', $horse->id)
            ->whereNull('parent_id')
            ->whereNull('deleted_at')
            ->whereRaw('is_sticky = false')
            ->with($eagerLoads);

        $this->applySort($commentsQuery, $sortParam, $horse->id);

        $commentsPaginator = $commentsQuery->paginate(20);

        // Pre-compute critic status for all visible commenters in two aggregate queries.
        $allUserIds = $stickyRaw->pluck('user_id')
            ->concat($commentsPaginator->pluck('user_id'))
            ->concat($commentsPaginator->flatMap(fn ($c) => $c->replies->pluck('user_id')))
            ->concat($stickyRaw->flatMap(fn ($c) => $c->replies->pluck('user_id')))
            ->unique()
            ->filter();

        $criticIds = $this->resolveCriticIds($allUserIds);

        $shapeReply = fn ($r) => [
            'id'            => $r->id,
            'body'          => $filter->filter($r->body),
            'user'          => $this->shapeUser($r->user, $criticIds),
            'created_at'    => $r->created_at->toISOString(),
            'author_rating' => $ratingData($r->user_id),
            'likes'         => $r->votes->where('vote', 'like')->count(),
            'dislikes'      => $r->votes->where('vote', 'dislike')->count(),
            'user_vote'     => $currentUserId ? $r->votes->firstWhere('user_id', $currentUserId)?->vote : null,
        ];

        $shapeComment = fn ($c) => [
            'id'            => $c->id,
            'body'          => $filter->filter($c->body),
            'user'          => $this->shapeUser($c->user, $criticIds),
            'created_at'    => $c->created_at->toISOString(),
            'author_rating' => $ratingData($c->user_id),
            'is_sticky'     => $c->is_sticky,
            'likes'         => $c->votes->where('vote', 'like')->count(),
            'dislikes'      => $c->votes->where('vote', 'dislike')->count(),
            'user_vote'     => $currentUserId ? $c->votes->firstWhere('user_id', $currentUserId)?->vote : null,
            'replies'       => $c->replies->map($shapeReply)->values(),
        ];

        $userRating = null;
        if ($currentUserId && ($r = $ratingsByUser->get($currentUserId))) {
            $userRating = ['value' => $r->value, 'intensity' => $r->intensity];
        }

        return Inertia::render('Horses/Show', [
            'horse' => [
                'id'             => $horse->id,
                'name'           => $horse->name,
                'slug'           => $horse->slug,
                'description'    => $horse->description,
                'notes'          => $horse->notes,
                'episode'        => $horse->episode,
                'weight_lbs'     => $horse->weight_lbs,
                'age_at_capture' => $horse->age_at_capture,
                'parents'        => $horse->parents,
                'is_locked'      => $horse->is_locked,
                'image_path'     => $horse->image_path,
                'avg_rating'     => $horse->averageEffectiveRating(),
                'tier'           => $horse->tier(),
                'ratings_count'  => $ratingsByUser->count(),
            ],
            'stickyComments' => $stickyRaw->map($shapeComment)->values(),
            'comments'       => $commentsPaginator->through($shapeComment),
            'userRating'     => $userRating,
            'currentSort'    => $sortParam,
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function shapeUser($user, Collection $criticIds): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'role'      => $user->role,
            'is_critic' => $criticIds->contains($user->id),
        ];
    }

    private function resolveCriticIds(Collection $userIds): Collection
    {
        if ($userIds->isEmpty()) return collect();

        $ratingCounts  = Rating::whereIn('user_id', $userIds)
            ->groupBy('user_id')
            ->selectRaw('user_id, COUNT(*) as cnt')
            ->pluck('cnt', 'user_id');

        $commentCounts = Comment::whereNull('deleted_at')
            ->whereIn('user_id', $userIds)
            ->groupBy('user_id')
            ->selectRaw('user_id, COUNT(*) as cnt')
            ->pluck('cnt', 'user_id');

        return $userIds->filter(
            fn ($id) => ($ratingCounts[$id] ?? 0) >= 25 && ($commentCounts[$id] ?? 0) >= 10
        )->values();
    }

    /**
     * Applies the requested sort to the comment query.
     *
     * IMPORTANT — PostgreSQL quoting rules applied throughout:
     *   • String literals → single quotes  ('like', 'dislike', 'strong', 'light')
     *   • Identifiers     → double quotes  ("comment_votes", "comments", etc.)
     *   MySQL also accepts single-quoted strings, so this is universally safe.
     */
    private function applySort($query, string $sort, int $horseId): void
    {
        switch ($sort) {
            case 'popular':
                $query
                    ->orderByRaw(
                        "(SELECT COUNT(*) FROM comment_votes WHERE comment_id = comments.id AND vote = 'like')
                       - (SELECT COUNT(*) FROM comment_votes WHERE comment_id = comments.id AND vote = 'dislike') DESC"
                    )
                    ->orderBy('comments.created_at', 'desc');
                break;

            case 'controversial':
                // Score = total_votes / (|likes − dislikes| + 1)
                // High score = many votes with a near-even split.
                $query
                    ->orderByRaw(
                        "(SELECT COUNT(*) FROM comment_votes WHERE comment_id = comments.id)::float
                       / (ABS(
                              (SELECT COUNT(*) FROM comment_votes WHERE comment_id = comments.id AND vote = 'like')
                            - (SELECT COUNT(*) FROM comment_votes WHERE comment_id = comments.id AND vote = 'dislike')
                         ) + 1) DESC"
                    )
                    ->orderBy('comments.created_at', 'desc');
                break;

            case 'oldest':
                $query->orderBy('comments.created_at', 'asc');
                break;

            case 'highest_rated':
                // Correlated subquery — avoids a JOIN that would complicate pagination.
                // Single-quoted string literals and ELSE clause default unrated to -999 (sorts last).
                $query->orderByRaw(
                    "COALESCE(
                        (SELECT CASE
                            WHEN intensity = 'strong' THEN value + 0.3
                            WHEN intensity = 'light'  THEN value - 0.3
                            ELSE value + 0.0
                         END
                         FROM ratings
                         WHERE ratings.user_id = comments.user_id
                           AND ratings.horse_id = ?
                         LIMIT 1),
                        -999
                    ) DESC",
                    [$horseId]
                )->orderBy('comments.created_at', 'desc');
                break;

            case 'lowest_rated':
                $query->orderByRaw(
                    "COALESCE(
                        (SELECT CASE
                            WHEN intensity = 'strong' THEN value + 0.3
                            WHEN intensity = 'light'  THEN value - 0.3
                            ELSE value + 0.0
                         END
                         FROM ratings
                         WHERE ratings.user_id = comments.user_id
                           AND ratings.horse_id = ?
                         LIMIT 1),
                        999
                    ) ASC",
                    [$horseId]
                )->orderBy('comments.created_at', 'desc');
                break;

            case 'latest':
            default:
                $query->orderBy('comments.created_at', 'desc');
                break;
        }
    }
}