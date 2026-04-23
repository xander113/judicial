<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ban_appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ban_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('message');
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->foreignId('decided_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
            $table->unique('ban_id'); // One appeal per ban
        });
    }
    public function down(): void { Schema::dropIfExists('ban_appeals'); }
};