<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBanRequest;
use App\Models\Ban;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BanController extends Controller
{
    public function index(): Response
    {
        $bans = Ban::with(['user:id,name,email', 'bannedBy:id,name'])
            ->latest()
            ->paginate(30);

        return Inertia::render('Admin/Bans', compact('bans'));
    }

    public function store(StoreBanRequest $request): RedirectResponse
    {
        $target = User::findOrFail($request->user_id);

        // Moderators cannot ban admins or other moderators
        if ($request->user()->isModerator() && $target->isAdminOrModerator()) {
            abort(403, 'Moderators cannot ban admins or other moderators.');
        }

        Ban::create([
            'user_id'          => $target->id,
            'banned_by_user_id'=> $request->user()->id,
            'reason'           => $request->reason,
            'type'             => $request->type,
            'expires_at'       => $request->type === 'temporary' ? $request->expires_at : null,
        ]);

        return back()->with('success', "User {$target->name} has been banned.");
    }

    /**
     * Deactivate a ban (admin only — override).
     */
    public function override(Request $request, Ban $ban): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $ban->update([
            'is_active'              => false,
            'overridden_by_user_id'  => $request->user()->id,
            'overridden_at'          => now(),
        ]);

        return back()->with('success', 'Ban has been overridden.');
    }
}