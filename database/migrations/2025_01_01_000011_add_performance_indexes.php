<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Comments: the horse show query filters by horse_id + parent_id IS NULL + soft-delete
        Schema::table('comments', function (Blueprint $table) {
            $table->index(['horse_id', 'parent_id', 'deleted_at'], 'idx_comments_horse_parent_deleted');
            $table->index('user_id', 'idx_comments_user');
        });

        // Ratings: the weekly top/lowest carousel scans by created_at / updated_at
        Schema::table('ratings', function (Blueprint $table) {
            $table->index(['created_at'], 'idx_ratings_created');
            $table->index(['updated_at'], 'idx_ratings_updated');
        });

        // Bans: CheckBanned middleware hits this on every authenticated request
        Schema::table('bans', function (Blueprint $table) {
            $table->index(['user_id', 'is_active'], 'idx_bans_user_active');
        });

        // Ban appeals: existence check per ban
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->index('status', 'idx_ban_appeals_status');
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('idx_comments_horse_parent_deleted');
            $table->dropIndex('idx_comments_user');
        });
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropIndex('idx_ratings_created');
            $table->dropIndex('idx_ratings_updated');
        });
        Schema::table('bans', function (Blueprint $table) {
            $table->dropIndex('idx_bans_user_active');
        });
        Schema::table('ban_appeals', function (Blueprint $table) {
            $table->dropIndex('idx_ban_appeals_status');
        });
    }
};
