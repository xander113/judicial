<?php
namespace App\Http\Controllers;

use App\Models\Horse;
use App\Services\CommentFilter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HorseController extends Controller
{
    public function index(): Response
    {
        $horses = Horse::withCount('ratings')
            ->with('ratings')
            ->orderBy('episode')
            ->orderBy('name')
            ->get()
            ->map(fn(Horse $h) => [
                'id'           => $h->id,
                'name'         => $h->name,
                'slug'         => $h->slug,
                'episode'      => $h->episode,
                'weight_lbs'   => $h->weight_lbs,
                'image_path'   => $h->image_path,
                'is_locked'    => $h->is_locked,
                'avg_rating'   => $h->averageEffectiveRating(),
                'tier'         => $h->tier(),
                'ratings_count'=> $h->ratings_count,
            ]);

        return Inertia::render('Horses/Index', compact('horses'));
    }

    public function show(Horse $horse, Request $request, CommentFilter $filter): Response
    {
        $comments = $horse->comments()
            ->with('user:id,name')
            ->paginate(20)
            ->through(fn($c) => [
                'id'         => $c->id,
                'body'       => $filter->filter($c->body),
                'user'       => $c->user,
                'created_at' => $c->created_at->toISOString(),
            ]);

        $userRating = null;
        if ($request->user()) {
            $r = $horse->ratings()->where('user_id', $request->user()->id)->first();
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
                'ratings_count'  => $horse->ratings()->count(),
            ],
            'comments'   => $comments,
            'userRating' => $userRating,
        ]);
    }
}