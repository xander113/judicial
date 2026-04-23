<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BanAppeal extends Model
{
    protected $fillable = [
        'ban_id', 'user_id', 'message',
        'status', 'decided_by_user_id', 'decided_at',
    ];

    protected $casts = ['decided_at' => 'datetime'];

    public function ban(): BelongsTo       { return $this->belongsTo(Ban::class); }
    public function user(): BelongsTo      { return $this->belongsTo(User::class); }
    public function decidedBy(): BelongsTo { return $this->belongsTo(User::class, 'decided_by_user_id'); }
}