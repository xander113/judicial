<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use SoftDeletes;
    protected $fillable = ['horse_id', 'user_id', 'body', 'deleted_by_user_id'];

    public function horse(): BelongsTo     { return $this->belongsTo(Horse::class); }
    public function user(): BelongsTo      { return $this->belongsTo(User::class); }
    public function deletedBy(): BelongsTo { return $this->belongsTo(User::class, 'deleted_by_user_id'); }
}