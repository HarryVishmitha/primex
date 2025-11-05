<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE class_schedules
            ADD CONSTRAINT chk_class_schedules_time
            CHECK (ends_at > starts_at)
        ");

        DB::statement("
            ALTER TABLE subscriptions
            ADD CONSTRAINT chk_subscriptions_time
            CHECK (ends_at > starts_at)
        ");

        DB::statement("
            ALTER TABLE attendance_logs
            ADD CONSTRAINT chk_attendance_logs_time
            CHECK (checked_out_at IS NULL OR checked_out_at > checked_in_at)
        ");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE class_schedules DROP CHECK chk_class_schedules_time');
        DB::statement('ALTER TABLE subscriptions DROP CHECK chk_subscriptions_time');
        DB::statement('ALTER TABLE attendance_logs DROP CHECK chk_attendance_logs_time');
    }
};

