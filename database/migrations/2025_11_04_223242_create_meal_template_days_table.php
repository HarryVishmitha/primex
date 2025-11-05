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
        Schema::create('meal_template_days', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUlid('template_id')->constrained('meal_plan_templates')->cascadeOnDelete();
            $table->unsignedInteger('day_no');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'template_id', 'day_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_template_days');
    }
};
