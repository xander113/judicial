<?php

namespace Database\Seeders;

use App\Models\Horse;
use App\Models\HorseSerializationQueue;
use Illuminate\Database\Seeder;

class HorseSerializationQueueSeeder extends Seeder
{
    /**
     * Inserts any horse that is NOT yet in the queue.
     * Safe to re-run after new episodes are seeded.
     */
    public function run(): void
    {
        $existingHorseIds = HorseSerializationQueue::pluck('horse_id')->toArray();
        $maxOrder         = HorseSerializationQueue::max('queue_order') ?? 0;

        Horse::orderBy('id')
            ->whereNotIn('id', $existingHorseIds)
            ->each(function (Horse $horse) use (&$maxOrder) {
                HorseSerializationQueue::create([
                    'horse_id'    => $horse->id,
                    'queue_order' => ++$maxOrder,
                ]);
            });
    }
}
