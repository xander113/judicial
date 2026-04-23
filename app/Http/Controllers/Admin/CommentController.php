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
        $comment->update(['deleted_by_user_id' => $request->user()->id]);
        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }
}