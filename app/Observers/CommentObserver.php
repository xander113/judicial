<?php

namespace App\Observers;

use App\Models\Comment;
use App\Models\HorseSerializationQueue;

class CommentObserver
{
    /**
     * Fires when any comment or reply is created.
     * If the author is authentic, remove the next pending serialization entry.
     */
    public function created(Comment $comment): void
    {
        if ($comment->user?->authentic) {
            HorseSerializationQueue::removeNext();
        }
    }
}
