<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Horse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Horse $horse): RedirectResponse
    {
        if ($horse->is_locked) {
            return back()->withErrors(['body' => 'Comments are locked for this horse.']);
        }

        $horse->comments()->create([
            'user_id' => $request->user()->id,
            'body'    => $request->validated('body'),
        ]);

        return back()->with('success', 'Comment posted.');
    }
}