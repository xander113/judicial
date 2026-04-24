<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per user-comment pair.
     * Multiple reports on the same comment are combined in the admin view
     * by grouping on comment_id and counting rows.
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 100)->nullable();
            $table->enum('status', ['open', 'dismissed'])->default('open');
            $table->timestamps();

            $table->unique(['comment_id', 'reporter_id']); // one report per user per comment
            $table->index(['comment_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
