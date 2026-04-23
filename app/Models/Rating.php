<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    protected $fillable = ['horse_id', 'user_id', 'value', 'intensity'];
    protected $casts    = ['value' => 'integer'];

    public function horse(): BelongsTo { return $this->belongsTo(Horse::class); }
    public function user(): BelongsTo  { return $this->belongsTo(User::class); }

    public function effectiveValue(): float
    {
        return match ($this->intensity) {
            'strong' => $this->value + 0.3,
            'light'  => $this->value - 0.3,
            default  => (float) $this->value,
        };
    }

    public function label(): string
    {
        return $this->intensity === 'normal'
            ? (string) $this->value
            : "{$this->intensity} {$this->value}";
    }
}