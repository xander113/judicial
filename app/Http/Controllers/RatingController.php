<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreRatingRequest;
use App\Models\Horse;
use Illuminate\Http\RedirectResponse;

class RatingController extends Controller
{
    /**
     * Creates or updates the authenticated user's rating for a horse.
     */
    public function store(StoreRatingRequest $request, Horse $horse): RedirectResponse
    {
        $horse->ratings()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->validated(),
        );

        return back()->with('success', 'Rating saved.');
    }
}