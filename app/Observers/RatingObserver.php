<?php

namespace App\Observers;

use App\Models\HorseSerializationQueue;
use App\Models\Rating;

class RatingObserver
{
    /**
     * Fires only when a brand-new rating is created (not on update).
     * If the rater is authentic, remove the next pending serialization entry.
     */
    public function created(Rating $rating): void
    {
        if ($rating->user?->authentic) {
            HorseSerializationQueue::removeNext();
        }
    }
}
