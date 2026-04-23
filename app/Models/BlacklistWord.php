<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlacklistWord extends Model
{
    protected $fillable = ['word', 'added_by_user_id'];
    public function addedBy(): BelongsTo { return $this->belongsTo(User::class, 'added_by_user_id'); }
}