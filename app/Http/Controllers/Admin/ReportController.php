<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Lists comments that have at least one open report.
     * Multiple reports on the same comment are combined — one row per comment,
     * showing the total count and all unique reasons submitted.
     */
    public function index(): Response
    {
        $reportedComments = Comment::withTrashed()
            ->whereHas('reports', fn ($q) => $q->where('status', 'open'))
            ->withCount(['reports as open_count' => fn ($q) => $q->where('status', 'open')])
            ->with([
                'reports' => fn ($q) => $q->where('status', 'open')
                    ->with('reporter:id,name')
                    ->latest(),
                'horse:id,name,slug',
                'user:id,name',
            ])
            ->orderByDesc('open_count')
            ->paginate(30);

        return Inertia::render('Admin/Reports', compact('reportedComments'));
    }

    /**
     * Dismiss all open reports for a comment without deleting the comment.
     */
    public function dismiss(Comment $comment): RedirectResponse
    {
        Report::where('comment_id', $comment->id)
            ->where('status', 'open')
            ->update(['status' => 'dismissed']);

        return back()->with('success', 'Reports dismissed.');
    }
}
