<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Horse;
use App\Services\RichTextSanitizer;
use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Horse $horse, RichTextSanitizer $sanitizer): RedirectResponse
    {
        if ($horse->is_locked) {
            return back()->withErrors(['body' => 'Comments are locked for this horse.']);
        }

        $parentId = $request->validated('parent_id');

        // If replying, confirm the parent belongs to this horse and is top-level.
        if ($parentId !== null) {
            $parent = Comment::find($parentId);

            if (! $parent || $parent->horse_id !== $horse->id || $parent->parent_id !== null) {
                return back()->withErrors(['body' => 'Invalid reply target.']);
            }
        }

        $horse->comments()->create([
            'user_id'   => $request->user()->id,
            'body'      => $sanitizer->sanitize($request->validated('body')),
            'parent_id' => $parentId,
        ]);

        return back()->with('success', 'Comment posted.');
    }
}
