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
        Schema::create('workout_sets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUlid('session_id')->constrained('workout_sessions')->cascadeOnDelete();
            $table->foreignUlid('exercise_id')->constrained('exercises')->cascadeOnDelete();
            $table->unsignedInteger('set_no');
            $table->unsignedInteger('reps')->nullable();
            $table->decimal('weight_kg', 6, 2)->nullable();
            $table->decimal('rpe', 4, 1)->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'session_id', 'set_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_sets');
    }
};
