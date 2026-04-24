<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comment_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('vote', ['like', 'dislike']);
            $table->timestamps();

            $table->unique(['comment_id', 'user_id']);
            $table->index(['comment_id', 'vote']); // fast vote-type counts
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_votes');
    }
};
