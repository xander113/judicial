<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'horse_id',
        'user_id',
        'body',
        'parent_id',
        'is_sticky',
        'deleted_by_user_id',
    ];

    protected $casts = [
        'is_sticky' => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function horse(): BelongsTo     { return $this->belongsTo(Horse::class); }
    public function user(): BelongsTo      { return $this->belongsTo(User::class); }
    public function deletedBy(): BelongsTo { return $this->belongsTo(User::class, 'deleted_by_user_id'); }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->latest();
    }

    public function votes(): HasMany
    {
        return $this->hasMany(CommentVote::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
