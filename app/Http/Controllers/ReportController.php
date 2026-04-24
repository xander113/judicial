<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request, Comment $comment): RedirectResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'in:Spam,Harassment,Inappropriate Content,Other'],
        ]);

        // Prevent duplicate reports from the same user on the same comment.
        $alreadyReported = Report::where([
            'comment_id'  => $comment->id,
            'reporter_id' => $request->user()->id,
        ])->exists();

        if ($alreadyReported) {
            return back()->withErrors(['reason' => 'You have already reported this comment.']);
        }

        Report::create([
            'comment_id'  => $comment->id,
            'reporter_id' => $request->user()->id,
            'reason'      => $request->reason,
        ]);

        return back()->with('success', 'Comment reported. Thank you.');
    }
}
