<?php

namespace Database\Seeders;

use App\Models\Horse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Appends Episode 5 horses discovered in the latest transcript.
 * Uses updateOrCreate so re-running is safe.
 *
 * New horses identified:
 *   Garlic Butter  — DNA experiment from the four fastest; crown champion; $6,500 prize winner
 *   Poot           — DNA from Lemon Pepper + Garlic Butter; 5.3 speed; starts new lineage; $7,500 champion
 *   Ugly Duckling  — natty (no DNA modification); shockingly close to Poot's speed
 *   Clint Dog      — DNA experiment; 5.2 speed (fastest ever recorded in-game); planned lineage starter
 */
class EpisodeFiveSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->horses() as $data) {
            $data['slug'] = Str::slug($data['name']);
            Horse::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }

    private function horses(): array
    {
        return [
            [
                'name'           => 'Garlic Butter',
                'episode'        => 5,
                'description'    => 'Emerged from the DNA vat as the unlikely partner to Lemon Pepper, forming the two-headed spear at the top of CaseOh\'s stable. Raced through the champion bracket at $6,500 entry and took the crown. "As long as garlic butter doesn\'t flip, this is a guaranteed win." Its DNA, combined with Lemon Pepper\'s, would later birth the legendary Poot.',
                'notes'          => '"Garlic butter is crown champion." Won $6,500 champion race. Parent of Poot (with Lemon Pepper). One of the two fastest horses ever at this point in the series.',
                'parents'        => ['5G (DNA)', 'Billy (DNA)', 'Lemon Pepper (DNA)', 'Barcode (DNA)'],
                'weight_lbs'     => null,
                'age_at_capture' => null,
            ],
            [
                'name'           => 'Poot',
                'episode'        => 5,
                'description'    => 'The most important horse in the series to this point. Born from the combined DNA of Lemon Pepper and Garlic Butter, Poot achieved the elusive 5.3 speed score — the fastest ever recorded. The catch: "I cannot believe out of all the time we have been searching for the elusive 5.3 that it came out looking like this goober." Poot looks, charitably, like a fart given physical form. It did not matter. Poot wins. "Poot is what all of this work wound up being." Won the $7,500 champion race and started a new lineage.',
                'notes'          => '"A new lineage has just started. And you know who it starts with? Poot." Best recorded DNA time: 5.3. Won $7,500 champion race. "Bro looks like a poop. I don\'t know what to tell you. He looks like somebody farted."',
                'parents'        => ['Lemon Pepper (DNA)', 'Garlic Butter (DNA)'],
                'weight_lbs'     => null,
                'age_at_capture' => null,
            ],
            [
                'name'           => 'Ugly Duckling',
                'episode'        => 5,
                'description'    => 'A naturally born horse with zero DNA modification — pure natty — who threatened to embarrass years of laboratory experimentation. "There\'s no way. There\'s no way. There\'s no way a naturally born racer is faster." It was not faster. But it was close enough to cause CaseOh visible distress. Ran official champion races and did not embarrass itself.',
                'notes'          => '"YO, THE UGLY DUCKLING IS NOT THAT FAR BEHIND OLD POOT, BRO." Natty. Ran two normal races and a champion circuit. Made CaseOh question everything.',
                'parents'        => null,
                'weight_lbs'     => null,
                'age_at_capture' => null,
            ],
            [
                'name'           => 'Clint Dog',
                'episode'        => 5,
                'description'    => 'The new apex of engineered speed. Clint Dog — apparently born with a straw hat and weighing roughly 40 lbs more than Poot — recorded a 5.2 in the DNA synchronization vat, the fastest number ever seen in the series. "YOU MEAN TO TELL ME THIS IS THE FASTEST THING IN THE GAME SO FAR?" CaseOh refused to accept it on appearance alone. Race results were inconsistent on debut. The plan: "Tomorrow we get Poot and Clint\'s DNA, throw them in the mixer. I think that\'s how we can get a 5.1." A new lineage in motion.',
                'notes'          => '"The Lineage Starts with Clint Dog." Best recorded DNA time: 5.2 (fastest in the game). Born wearing a straw hat. Weighs ~40 lbs more than Poot. Planned parent of the next generation (with Poot).',
                'parents'        => ['Poot (DNA)', 'DNA experiment'],
                'weight_lbs'     => null,
                'age_at_capture' => null,
            ],
        ];
    }
}
