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
        Schema::create('exercises', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('muscle_group', ['full_body', 'upper_body', 'lower_body', 'core', 'cardio', 'mobility']);
            $table->enum('equipment', ['bodyweight', 'machines', 'free_weights', 'cardio', 'resistance_bands', 'other'])->default('bodyweight');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
