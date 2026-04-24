<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorseSerializationQueue extends Model
{
    protected $table = 'horse_serialization_queue';

    protected $fillable = ['horse_id', 'queue_order'];

    public function horse(): BelongsTo
    {
        return $this->belongsTo(Horse::class);
    }

    /**
     * Removes the next entry from the queue (lowest queue_order, FIFO).
     * Safe to call on an empty queue — does nothing.
     */
    public static function removeNext(): void
    {
        self::orderBy('queue_order')->first()?->delete();
    }
}
