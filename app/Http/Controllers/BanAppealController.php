<?php
namespace App\Http\Controllers;

use App\Models\BanAppeal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BanAppealController extends Controller
{
    /**
     * Authenticated banned user submits an appeal.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate(['message' => ['required', 'string', 'min:10', 'max:2000']]);

        $ban = $request->user()->getActiveBan();

        if (! $ban) {
            return back()->withErrors(['message' => 'You do not have an active ban.']);
        }

        if ($ban->appeal()->exists()) {
            return back()->withErrors(['message' => 'An appeal has already been submitted for this ban.']);
        }

        BanAppeal::create([
            'ban_id'  => $ban->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        return back()->with('success', 'Appeal submitted. An admin will review it.');
    }
}