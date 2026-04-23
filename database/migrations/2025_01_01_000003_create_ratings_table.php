<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Rating tier thresholds (on effective_value = value + intensity_offset):
 *   strong → +0.3 | normal → 0.0 | light → −0.3
 *
 *   bad      : effective < 3.7   (below strong-4)
 *   mediocre : 3.7 ≤ effective ≤ 5.7  (strong-4 through light-6)
 *   good     : effective > 5.7   (above light-6)
 */
return new class extends Migration {
    public function up(): void {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('value');   // 1–10
            $table->enum('intensity', ['strong', 'normal', 'light'])->default('normal');
            $table->timestamps();
            $table->unique(['horse_id', 'user_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('ratings'); }
};