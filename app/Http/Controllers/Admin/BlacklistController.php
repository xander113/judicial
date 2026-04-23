<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlacklistWord;
use App\Services\CommentFilter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlacklistController extends Controller
{
    public function index(): Response
    {
        $words = BlacklistWord::with('addedBy:id,name')->latest()->get();
        return Inertia::render('Admin/Blacklist', compact('words'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate(['word' => ['required', 'string', 'max:100', 'unique:blacklist_words,word']]);

        BlacklistWord::create([
            'word'              => strtolower(trim($request->word)),
            'added_by_user_id'  => $request->user()->id,
        ]);

        CommentFilter::clearCache();

        return back()->with('success', 'Word added to blacklist.');
    }

    public function destroy(BlacklistWord $blacklistWord): RedirectResponse
    {
        $blacklistWord->delete();
        CommentFilter::clearCache();
        return back()->with('success', 'Word removed from blacklist.');
    }
}