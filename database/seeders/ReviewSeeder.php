<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Horse;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    // ── Comment body pool ─────────────────────────────────────────────────────
    // Mix of plain text and basic rich-text (bold/italic) comments that reflect
    // the tone of CaseOh's chat during the Horsey Game streams.

    private const BODIES = [
        'LMAO',
        'fuck off',
        "what?",
        "what is this...mess!",
        "tester",
        "blah lbah."
    ];

    private const INTENSITIES = ['strong', 'normal', 'light'];

    // ── Run ───────────────────────────────────────────────────────────────────

    public function run(): void
    {
        // Ensure at least 3 users exist to seed from.
        while (User::count() <= 99) {
            User::factory()->create();
        }

        $userIds = User::orderBy('id')->take(99)->pluck('id')->toArray();
        $horses  = Horse::all();

        if ($horses->isEmpty()) {
            $this->command->warn('No horses found. Run HorseSeeder first.');
            return;
        }

        $ratingCount  = 0;
        $commentCount = 0;

        foreach ($horses as $horse) {
            // ── Ratings (one per user per horse; unique constraint respected) ──
            foreach ($userIds as $userId) {
                Rating::updateOrCreate(
                    ['horse_id' => $horse->id, 'user_id' => $userId],
                    [
                        'value'     => rand(0, 10),
                        'intensity' => self::INTENSITIES[array_rand(self::INTENSITIES)],
                    ],
                );
                $ratingCount++;
            }

            // ── Comments (2–12 per horse, no uniqueness constraint) ───────────
            // Combined with the 3 ratings this gives 5–15 total reviews per horse.
            $commentsToDo = rand(2, 50);
            $bodyPool     = self::BODIES;
            shuffle($bodyPool);

            for ($i = 0; $i < $commentsToDo; $i++) {
                Comment::create([
                    'horse_id'  => $horse->id,
                    'user_id'   => $userIds[array_rand($userIds)],
                    'body'      => $bodyPool[$i % count($bodyPool)],
                    'parent_id' => null,
                ]);
                $commentCount++;
            }
        }

        $this->command->info(
            "ReviewSeeder complete — {$ratingCount} ratings, {$commentCount} comments across {$horses->count()} horses.",
        );
    }
}