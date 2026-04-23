<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModeratorController extends Controller
{
    public function index(): Response
    {
        $moderators = User::where('role', 'moderator')->get(['id', 'name', 'email', 'created_at']);
        $users      = User::where('role', 'user')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Moderators', compact('moderators', 'users'));
    }

    /**
     * Promote a regular user to moderator (admin only).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate(['user_id' => ['required', 'exists:users,id']]);

        $user = User::findOrFail($request->user_id);

        if ($user->isAdminOrModerator()) {
            return back()->withErrors(['user_id' => 'This user is already a moderator or admin.']);
        }

        $user->update(['role' => 'moderator']);

        return back()->with('success', "{$user->name} is now a moderator.");
    }

    /**
     * Demote a moderator back to a regular user (admin only).
     */
    public function destroy(User $user): RedirectResponse
    {
        if (! $user->isModerator()) {
            return back()->withErrors(['user_id' => 'User is not a moderator.']);
        }

        $user->update(['role' => 'user']);

        return back()->with('success', "{$user->name} has been demoted.");
    }
}