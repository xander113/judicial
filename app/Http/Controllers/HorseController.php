<?php

namespace App\Http\Controllers;

use App\Models\Horse;
use App\Models\Rating;
use App\Services\CommentFilter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HorseController extends Controller
{
    public function index(): Response
    {
        // Single eager load for all horses and their ratings.
        $all = Horse::with('ratings')->orderBy('episode')->orderBy('name')->get();

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

        // Horse IDs that received a new or updated rating in the last 7 days.
        $weekAgo   = now()->subDays(7);
        $weeklyIds = Rating::where(function ($q) use ($weekAgo) {
            $q->where('created_at', '>=', $weekAgo)
              ->orWhere('updated_at', '>=', $weekAgo);
        })->distinct()->pluck('horse_id');

        // Filter from the already-loaded collection — no extra query.
        $weeklyHorses = $all
            ->filter(fn ($h) => $weeklyIds->contains($h->id)
                && $h->averageEffectiveRating() !== null)
            ->map($shape);

        $topThisWeek    = $weeklyHorses->sortByDesc('avg_rating')->values()->take(8);
        $lowestThisWeek = $weeklyHorses->sortBy('avg_rating')->values()->take(8);

        return Inertia::render('Horses/Index', [
            'horses'         => $horses,
            'topThisWeek'    => $topThisWeek,
            'lowestThisWeek' => $lowestThisWeek,
        ]);
    }

    public function show(Horse $horse, Request $request, CommentFilter $filter): Response
    {
        $ratingsByUser = $horse->ratings()->get()->keyBy('user_id');

        $ratingData = fn ($userId) => ($r = $ratingsByUser->get($userId))
            ? ['value' => $r->value, 'intensity' => $r->intensity]
            : null;

        $comments = $horse->comments()
            ->whereNull('parent_id')
            ->with([
                'user:id,name',
                'replies' => fn ($q) => $q->with('user:id,name'),
            ])
            ->paginate(20)
            ->through(function ($c) use ($filter, $ratingData) {
                return [
                    'id'            => $c->id,
                    'body'          => $filter->filter($c->body),
                    'user'          => $c->user,
                    'created_at'    => $c->created_at->toISOString(),
                    'author_rating' => $ratingData($c->user_id),
                    'replies'       => $c->replies->map(fn ($r) => [
                        'id'            => $r->id,
                        'body'          => $filter->filter($r->body),
                        'user'          => $r->user,
                        'created_at'    => $r->created_at->toISOString(),
                        'author_rating' => $ratingData($r->user_id),
                    ])->values(),
                ];
            });

        $userRating = null;
        if ($request->user()) {
            $r = $ratingsByUser->get($request->user()->id);
            if ($r) {
                $userRating = ['value' => $r->value, 'intensity' => $r->intensity];
            }
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
            'comments'   => $comments,
            'userRating' => $userRating,
        ]);
    }
}
