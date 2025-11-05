<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add CHECK constraint to subscriptions: ends_at > starts_at
        DB::statement('ALTER TABLE subscriptions ADD CONSTRAINT check_subscription_dates CHECK (ends_at > starts_at)');

        // Add CHECK constraint to attendance_logs: checked_out_at > checked_in_at (when not null)
        DB::statement('ALTER TABLE attendance_logs ADD CONSTRAINT check_attendance_checkout CHECK (checked_out_at IS NULL OR checked_out_at > checked_in_at)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop CHECK constraints
        DB::statement('ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_subscription_dates');
        DB::statement('ALTER TABLE attendance_logs DROP CONSTRAINT IF EXISTS check_attendance_checkout');
    }
};
