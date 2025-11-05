<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->removeDuplicateBookings();

        Schema::table('class_bookings', function (Blueprint $table) {
            $table->unique(
                ['tenant_id', 'schedule_id', 'member_id'],
                'class_bookings_tenant_schedule_member_unique'
            );
        });

        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->index(['tenant_id', 'checked_in_at'], 'attendance_tenant_checked_in_idx');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->dropIndex('attendance_tenant_checked_in_idx');
        });

        Schema::table('class_bookings', function (Blueprint $table) {
            $table->dropUnique('class_bookings_tenant_schedule_member_unique');
        });
    }

    private function removeDuplicateBookings(): void
    {
        DB::statement("
            DELETE cb1 FROM class_bookings cb1
            INNER JOIN class_bookings cb2
                ON cb1.tenant_id = cb2.tenant_id
                AND cb1.schedule_id = cb2.schedule_id
                AND cb1.member_id = cb2.member_id
                AND cb1.id > cb2.id
        ");
    }
};
