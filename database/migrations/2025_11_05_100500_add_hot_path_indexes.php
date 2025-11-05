<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addIndexIfMissing('subscriptions', ['tenant_id', 'member_id', 'status', 'ends_at'], 'sub_hot');
        $this->addIndexIfMissing('attendance_logs', ['tenant_id', 'member_id', 'checked_in_at'], 'att_member_time');
        $this->addIndexIfMissing('payments', ['tenant_id', 'member_id', 'paid_at'], 'pay_member_time');
        $this->addIndexIfMissing('payments', ['tenant_id', 'status'], 'pay_status');
        $this->addIndexIfMissing('invoices', ['tenant_id', 'member_id', 'issued_at'], 'inv_member_issued');
        $this->addIndexIfMissing('class_bookings', ['tenant_id', 'schedule_id', 'status'], 'book_sched_status');
        $this->addIndexIfMissing('class_bookings', ['tenant_id', 'member_id'], 'book_member');

        if ($this->indexExists('products', 'products_tenant_id_sku_unique')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropUnique('products_tenant_id_sku_unique');
            });
        }

        $this->addUniqueIfMissing('products', ['tenant_id', 'sku'], 'prod_tenant_sku_unique');
    }

    public function down(): void
    {
        $this->dropIndexIfExists('subscriptions', 'sub_hot');
        $this->dropIndexIfExists('attendance_logs', 'att_member_time');
        $this->dropIndexIfExists('payments', 'pay_member_time');
        $this->dropIndexIfExists('payments', 'pay_status');
        $this->dropIndexIfExists('invoices', 'inv_member_issued');
        $this->dropIndexIfExists('class_bookings', 'book_sched_status');
        $this->dropIndexIfExists('class_bookings', 'book_member');

        if ($this->indexExists('products', 'prod_tenant_sku_unique')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropUnique('prod_tenant_sku_unique');
            });
        }

        if (! $this->indexExists('products', 'products_tenant_id_sku_unique')) {
            Schema::table('products', function (Blueprint $table) {
                $table->unique(['tenant_id', 'sku']);
            });
        }
    }

    private function addIndexIfMissing(string $table, array $columns, string $name): void
    {
        if ($this->indexExists($table, $name)) {
            return;
        }

        Schema::table($table, function (Blueprint $table) use ($columns, $name) {
            $table->index($columns, $name);
        });
    }

    private function addUniqueIfMissing(string $table, array $columns, string $name): void
    {
        if ($this->indexExists($table, $name)) {
            return;
        }

        Schema::table($table, function (Blueprint $table) use ($columns, $name) {
            $table->unique($columns, $name);
        });
    }

    private function dropIndexIfExists(string $table, string $name): void
    {
        if (! $this->indexExists($table, $name)) {
            return;
        }

        Schema::table($table, function (Blueprint $table) use ($name) {
            $table->dropIndex($name);
        });
    }

    private function indexExists(string $table, string $name): bool
    {
        $database = DB::getDatabaseName();

        $result = DB::selectOne(
            'SELECT COUNT(*) AS aggregate
             FROM information_schema.statistics
             WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$database, $table, $name]
        );

        return (int) ($result->aggregate ?? 0) > 0;
    }
};

