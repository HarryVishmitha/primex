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
        Schema::create('class_bookings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUlid('schedule_id')->constrained('class_schedules')->cascadeOnDelete();
            $table->foreignUlid('member_id')->constrained('members')->cascadeOnDelete();
            $table->enum('status', ['reserved', 'checked_in', 'cancelled', 'no_show'])->default('reserved');
            $table->timestamps();

            $table->index(['tenant_id', 'schedule_id', 'status'], 'class_bookings_tenant_schedule_status_idx');
            $table->index(['tenant_id', 'member_id'], 'class_bookings_tenant_member_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_bookings');
    }
};
