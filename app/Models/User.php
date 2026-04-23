<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];
    protected $hidden   = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // Role helpers
    public function isAdmin(): bool             { return $this->role === 'admin'; }
    public function isModerator(): bool         { return $this->role === 'moderator'; }
    public function isAdminOrModerator(): bool  { return in_array($this->role, ['admin', 'moderator'], true); }

    // Ban helpers
    public function getActiveBan(): ?Ban
    {
        $ban = $this->bans()->where('is_active', true)->latest()->first();
        if (! $ban) return null;
        if ($ban->type === 'temporary' && $ban->expires_at?->isPast()) {
            $ban->update(['is_active' => false]);
            return null;
        }
        return $ban;
    }
    public function isBanned(): bool { return $this->getActiveBan() !== null; }

    // Relationships
    public function ratings(): HasMany      { return $this->hasMany(Rating::class); }
    public function comments(): HasMany     { return $this->hasMany(Comment::class); }
    public function bans(): HasMany         { return $this->hasMany(Ban::class); }
    public function banAppeals(): HasMany   { return $this->hasMany(BanAppeal::class); }
    public function blacklistWords(): HasMany { return $this->hasMany(BlacklistWord::class, 'added_by_user_id'); }
}