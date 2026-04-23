<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ban extends Model
{
    protected $fillable = [
        'user_id', 'banned_by_user_id', 'reason',
        'type', 'expires_at', 'is_active',
        'overridden_by_user_id', 'overridden_at',
    ];

    protected $casts = [
        'expires_at'    => 'datetime',
        'overridden_at' => 'datetime',
        'is_active'     => 'boolean',
    ];

    public function user(): BelongsTo       { return $this->belongsTo(User::class); }
    public function bannedBy(): BelongsTo   { return $this->belongsTo(User::class, 'banned_by_user_id'); }
    public function overriddenBy(): BelongsTo { return $this->belongsTo(User::class, 'overridden_by_user_id'); }
    public function appeal(): HasOne        { return $this->hasOne(BanAppeal::class); }
}