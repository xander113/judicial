<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Soft-delete a comment. If it is top-level, also soft-deletes all replies.
     */
    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        $actorId = $request->user()->id;

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

    /**
     * Toggle the sticky state of a comment.
     * A maximum of 3 comments may be stickied per horse.
     */
    public function sticky(Request $request, Comment $comment): RedirectResponse
    {
        if ($comment->is_sticky) {
            $comment->update(['is_sticky' => false]);
            return back()->with('success', 'Comment un-stickied.');
        }

        $stickyCount = Comment::where('horse_id', $comment->horse_id)
            ->where('is_sticky', true)
            ->whereNull('deleted_at')
            ->count();

        if ($stickyCount >= 3) {
            return back()->withErrors([
                'sticky' => 'Maximum 3 sticky comments per horse. Un-sticky one first.',
            ]);
        }

        $comment->update(['is_sticky' => true]);

        return back()->with('success', 'Comment stickied.');
    }
}
