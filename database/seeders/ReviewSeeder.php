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
        'Watching this one race gave me actual anxiety. Could not look away.',
        'I\'ve seen faster things at the glue factory. Just saying.',
        '<strong>Absolute unit.</strong> This horse does not miss.',
        'The leg action alone deserves a Nobel Prize.',
        'Mid at best. We\'ve seen better genetics from the DNA vat.',
        'Still can\'t believe this happened. <strong>Straight cinema.</strong>',
        'Tater\'s legacy lives on in this one. You can feel it.',
        'I put my channel points on this horse. <em>Worth every single one.</em>',
        'Not gonna lie, I was rooting against this one and still got impressed.',
        'The flip probability is way too high. Needs stabilization before the next race.',
        'Boot energy. <em>Remove the boots</em> and this thing is absolutely cooked.',
        '<strong>Top tier genetics.</strong> I said what I said and I stand by it.',
        'If CaseOh puts this in the vat it is genuinely over for the competition.',
        'Seven out of ten minimum. <em>Possibly goat material</em>, honestly.',
        'I\'ve seen better in the wild. Still doing numbers though.',
        'The weight-to-speed ratio makes absolutely no sense. <strong>Physics are broken.</strong>',
        'Underrated pick. Chat never gives this one enough credit.',
        'Certified midsection. Nothing special, nothing terrible. Dependable.',
        'This thing flips so fast I had to rewatch the clip three times.',
        'One of the better DNA experiments results. <em>Results firmly tracked.</em>',
        'Natty king. No lab involvement and still competing at the very top.',
        'Parents were a mistake but the offspring was a miracle. Classic story.',
        'Built for the short race. <strong>Absolutely cooked</strong> in long distance.',
        'Getting put in the vat would ruin this one\'s legacy fr.',
        'I genuinely cried watching this race. Game of the year no debate.',
        'The boots are carrying this horse and it is concerning. <em>Real test needs no boots.</em>',
        'Consistent in a way no other horse has been this series. That matters.',
        'This horse single-handedly saved the whole episode from being boring.',
        'Retired too soon. Would have been a whole dynasty.',
        '<strong>Actual cinema.</strong> No notes. Perfect.',
        'The DNA combination here was inspired. Someone in the chat called it.',
        'I\'ve bet on worse and won. I\'ve also bet on better and lost. <em>Such is life.</em>',
        'Comeback arc incoming. Mark my words.',
        'Genuinely the most athletic thing I have seen in this game so far.',
        'Questionable parents but <strong>incredible results</strong>. Defied the odds.',
    ];

    private const INTENSITIES = ['strong', 'normal', 'light'];

    // ── Run ───────────────────────────────────────────────────────────────────

    public function run(): void
    {
        // Ensure at least 3 users exist to seed from.
        while (User::count() < 3) {
            User::factory()->create();
        }

        $userIds = User::orderBy('id')->take(3)->pluck('id')->toArray();
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
                        'value'     => rand(1, 10),
                        'intensity' => self::INTENSITIES[array_rand(self::INTENSITIES)],
                    ],
                );
                $ratingCount++;
            }

            // ── Comments (2–12 per horse, no uniqueness constraint) ───────────
            // Combined with the 3 ratings this gives 5–15 total reviews per horse.
            $commentsToDo = rand(2, 12);
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