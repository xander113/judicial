<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Horse;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    // ── Comment body pool ─────────────────────────────────────────────────────
    // Mix of plain text and basic rich-text (bold/italic) comments that reflect
    // the tone of CaseOh's chat during the Horsey Game streams.

    // private const BODIES = [
    //     'LMAO',
    //     'fuck off'
    // ];

    // private const INTENSITIES = ['strong', 'normal', 'light'];

    // ── Run ───────────────────────────────────────────────────────────────────

    public function run(): void
    {
        // Ensure at least 3 users exist to seed from.
        // while (User::count() < 3) {
        //     User::factory()->create();
        // }

        // $userIds = User::orderBy('id')->take(3)->pluck('id')->toArray();
        // $horses  = Horse::all();

        // if ($horses->isEmpty()) {
        //     $this->command->warn('No horses found. Run HorseSeeder first.');
        //     return;
        // }

        // $ratingCount  = 0;
        // $commentCount = 0;

        for ($i=1; $i < 101; $i++) { 
            $ifuser = User::where("id", $i)->first();
            if (!$ifuser) {
                $user = new User;
                $user->id = $i;
                $user->name = "UserTest_$i";
                $user->email = "u$i@temp.com";
                $user->authentic = false;
                $user->password = '$2y$10$QqVsoZCaO8c.K5XeUtnX4e6LBfxUmnZCJpK4ZTB9J7wOGbLiuWEvG';
                $user->save();
            }
        }

        $this->command->info(
            "Users filled...",
        );
    }
}