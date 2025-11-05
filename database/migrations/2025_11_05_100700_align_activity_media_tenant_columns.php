<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->normalizeActivityLog();
        $this->normalizeMedia();
    }

    public function down(): void
    {
        $this->revertMedia();
        $this->revertActivityLog();
    }

    private function normalizeActivityLog(): void
    {
        if (! Schema::hasTable('activity_log') || ! Schema::hasColumn('activity_log', 'tenant_id')) {
            return;
        }

        DB::table('activity_log')
            ->where('tenant_id', '=', 'central')
            ->update(['tenant_id' => null]);

        $this->dropForeignIfExists('activity_log', 'activity_log_tenant_id_foreign');

        Schema::table('activity_log', function (Blueprint $table) {
            $table->char('tenant_id', 26)->nullable()->default(null)->change();
        });

        Schema::table('activity_log', function (Blueprint $table) {
            $table->foreign('tenant_id', 'activity_log_tenant_id_foreign')
                ->references('id')
                ->on('tenants')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    private function normalizeMedia(): void
    {
        if (! Schema::hasTable('media') || ! Schema::hasColumn('media', 'tenant_id')) {
            return;
        }

        DB::table('media')
            ->where('tenant_id', '=', 'central')
            ->update(['tenant_id' => null]);

        $this->dropForeignIfExists('media', 'media_tenant_id_foreign');

        Schema::table('media', function (Blueprint $table) {
            $table->char('tenant_id', 26)->nullable()->default(null)->change();
        });

        Schema::table('media', function (Blueprint $table) {
            $table->foreign('tenant_id', 'media_tenant_id_foreign')
                ->references('id')
                ->on('tenants')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    private function revertActivityLog(): void
    {
        if (! Schema::hasTable('activity_log') || ! Schema::hasColumn('activity_log', 'tenant_id')) {
            return;
        }

        $this->dropForeignIfExists('activity_log', 'activity_log_tenant_id_foreign');

        Schema::table('activity_log', function (Blueprint $table) {
            $table->string('tenant_id')->default('central')->change();
        });
    }

    private function revertMedia(): void
    {
        if (! Schema::hasTable('media') || ! Schema::hasColumn('media', 'tenant_id')) {
            return;
        }

        $this->dropForeignIfExists('media', 'media_tenant_id_foreign');

        Schema::table('media', function (Blueprint $table) {
            $table->string('tenant_id')->default('central')->change();
        });
    }

    private function dropForeignIfExists(string $table, string $constraint): void
    {
        if (! $this->foreignKeyExists($table, $constraint)) {
            return;
        }

        Schema::table($table, function (Blueprint $table) use ($constraint) {
            $table->dropForeign($constraint);
        });
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        $database = DB::getDatabaseName();

        $result = DB::selectOne(
            'SELECT COUNT(*) AS total
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?',
            [$database, $table, $constraint]
        );

        return (int) ($result->total ?? 0) > 0;
    }
};

