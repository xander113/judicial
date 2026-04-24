<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Each row in this table represents a pending serialization entry.
     * When an authentic user creates a rating or comment, the entry with
     * the lowest queue_order is deleted (FIFO decrement).
     */
    public function up(): void
    {
        Schema::create('horse_serialization_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horse_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('queue_order')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horse_serialization_queue');
    }
};
