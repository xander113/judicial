<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Horse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'notes',
        'episode',
        'weight_lbs',
        'age_at_capture',
        'parents',
        'is_locked',
        'image_path',
    ];

    protected $casts = [
        'parents'   => 'array',
        'is_locked' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Horse $horse) {
            if (empty($horse->slug)) {
                $horse->slug = Str::slug($horse->name);
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->whereNull('deleted_at')->latest();
    }

    // ── Rating aggregates ─────────────────────────────────────────────────────

    /**
     * Uses the already-loaded `ratings` relationship collection when available
     * to avoid N+1 queries on the index page (which serves from cache).
     * Falls back to a DB query only when the relationship is not loaded.
     *
     * Intensity offsets: strong +0.3 | normal 0 | light -0.3
     */
    public function averageEffectiveRating(): ?float
    {
        $ratings = $this->relationLoaded('ratings')
            ? $this->ratings
            : $this->ratings()->get();

        if ($ratings->isEmpty()) return null;

        $sum = $ratings->sum(fn (Rating $r) => $r->effectiveValue());

        return round($sum / $ratings->count(), 2);
    }

    /**
     * Tier thresholds (on effective value):
     *   bad      < 3.7   (below strong-4)
     *   mediocre 3.7–5.7 (strong-4 through light-6)
     *   good     > 5.7   (above light-6)
     */
    public function tier(): ?string
    {
        $avg = $this->averageEffectiveRating();
        if ($avg === null) return null;
        if ($avg < 3.7)  return 'bad';
        if ($avg <= 5.7) return 'mediocre';
        return 'good';
    }

    public function getRouteKeyName(): string { return 'slug'; }
}
