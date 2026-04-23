<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BanAppeal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BanAppealController extends Controller
{
    public function index(): Response
    {
        $appeals = BanAppeal::with([
            'user:id,name,email',
            'ban:id,reason,type,expires_at',
            'decidedBy:id,name',
        ])->latest()->paginate(30);

        return Inertia::render('Admin/Appeals', compact('appeals'));
    }

    /**
     * Admin approves or denies an appeal.
     */
    public function update(Request $request, BanAppeal $banAppeal): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Only admins may decide on appeals.');
        }

        $request->validate(['status' => ['required', 'in:approved,denied']]);

        $banAppeal->update([
            'status'              => $request->status,
            'decided_by_user_id'  => $request->user()->id,
            'decided_at'          => now(),
        ]);

        // If approved, lift the ban
        if ($request->status === 'approved') {
            $banAppeal->ban->update([
                'is_active'              => false,
                'overridden_by_user_id'  => $request->user()->id,
                'overridden_at'          => now(),
            ]);
        }

        return back()->with('success', 'Appeal has been ' . $request->status . '.');
    }
}