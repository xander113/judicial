<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Horse;
use Illuminate\Http\RedirectResponse;

class HorseLockController extends Controller
{
    public function lock(Horse $horse): RedirectResponse
    {
        $horse->update(['is_locked' => true]);
        return back()->with('success', "{$horse->name} comments locked.");
    }

    public function unlock(Horse $horse): RedirectResponse
    {
        $horse->update(['is_locked' => false]);
        return back()->with('success', "{$horse->name} comments unlocked.");
    }
}