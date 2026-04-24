<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentVote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentVoteController extends Controller
{
    /**
     * Toggle a like or dislike on a comment or reply.
     *
     * Behavior:
     *   - No existing vote   → create with the given type
     *   - Same type exists   → remove (toggle off)
     *   - Opposite exists    → switch to the new type
     */
    public function vote(Request $request, Comment $comment): RedirectResponse
    {
        $request->validate(['vote' => ['required', 'in:like,dislike']]);

        $existing = CommentVote::where([
            'comment_id' => $comment->id,
            'user_id'    => $request->user()->id,
        ])->first();

        if ($existing) {
            if ($existing->vote === $request->vote) {
                $existing->delete();
            } else {
                $existing->update(['vote' => $request->vote]);
            }
        } else {
            CommentVote::create([
                'comment_id' => $comment->id,
                'user_id'    => $request->user()->id,
                'vote'       => $request->vote,
            ]);
        }

        return back()->with('voteRecorded', true);
    }
}
