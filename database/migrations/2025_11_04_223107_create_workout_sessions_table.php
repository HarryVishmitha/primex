<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workout_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUlid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUlid('program_id')->nullable()->constrained('programs')->nullOnDelete();
            $table->dateTime('performed_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'member_id', 'performed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_sessions');
    }
};
