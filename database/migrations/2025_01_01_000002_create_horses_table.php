<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('horses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('episode')->nullable();
            $table->unsignedSmallInteger('weight_lbs')->nullable();
            $table->unsignedTinyInteger('age_at_capture')->nullable();
            $table->json('parents')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->string('image_path')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('horses'); }
};