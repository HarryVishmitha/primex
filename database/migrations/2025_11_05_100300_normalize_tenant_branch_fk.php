<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->normalizeDomains();
        $this->normalizeSettings();
        $this->normalizeTicketMessages();
    }

    public function down(): void
    {
        // intentionally left empty to avoid lossy reversals
    }

    private function normalizeDomains(): void
    {
        if (! Schema::hasTable('domains') || ! Schema::hasColumn('domains', 'tenant_id')) {
            return;
        }

        $this->dropForeignIfExists('domains', 'domains_tenant_id_foreign');

        Schema::table('domains', function (Blueprint $table) {
            $table->char('tenant_id', 26)->change();
        });

        Schema::table('domains', function (Blueprint $table) {
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
        });
    }

    private function normalizeSettings(): void
    {
        if (! Schema::hasTable('settings') || ! Schema::hasColumn('settings', 'tenant_id')) {
            return;
        }

        $this->dropForeignIfExists('settings', 'settings_tenant_id_foreign');

        Schema::table('settings', function (Blueprint $table) {
            $table->char('tenant_id', 26)->change();
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
        });
    }

    private function normalizeTicketMessages(): void
    {
        if (! Schema::hasTable('ticket_messages')) {
            return;
        }

        if (Schema::hasColumn('ticket_messages', 'tenant_id')) {
            $this->dropForeignIfExists('ticket_messages', 'ticket_messages_tenant_id_foreign');

            Schema::table('ticket_messages', function (Blueprint $table) {
                $table->char('tenant_id', 26)->change();
            });

            Schema::table('ticket_messages', function (Blueprint $table) {
                $table->foreign('tenant_id')
                    ->references('id')
                    ->on('tenants')
                    ->cascadeOnDelete()
                    ->cascadeOnUpdate();
            });
        }

        if (Schema::hasColumn('ticket_messages', 'branch_id')) {
            $this->dropForeignIfExists('ticket_messages', 'ticket_messages_branch_id_foreign');

            Schema::table('ticket_messages', function (Blueprint $table) {
                $table->char('branch_id', 26)->nullable()->change();
            });

            Schema::table('ticket_messages', function (Blueprint $table) {
                $table->foreign('branch_id')
                    ->references('id')
                    ->on('branches')
                    ->nullOnDelete()
                    ->cascadeOnUpdate();
            });
        }
    }

    private function dropForeignIfExists(string $table, string $constraintName): void
    {
        if (! $this->foreignKeyExists($table, $constraintName)) {
            return;
        }

        Schema::table($table, function (Blueprint $table) use ($constraintName) {
            $table->dropForeign($constraintName);
        });
    }

    private function foreignKeyExists(string $table, string $constraintName): bool
    {
        $database = DB::getDatabaseName();

        $result = DB::selectOne(
            'SELECT COUNT(*) AS total
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?',
            [$database, $table, $constraintName]
        );

        return (int) ($result->total ?? 0) > 0;
    }
};
