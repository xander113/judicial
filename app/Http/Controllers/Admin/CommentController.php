<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        $actorId = $request->user()->id;

        // If this is a top-level comment, soft-delete its replies first.
        if ($comment->parent_id === null) {
            $comment->replies()->each(function (Comment $reply) use ($actorId) {
                $reply->update(['deleted_by_user_id' => $actorId]);
                $reply->delete();
            });
        }

        $comment->update(['deleted_by_user_id' => $actorId]);
        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }
}
