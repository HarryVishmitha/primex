<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! $this->columnExists('invoice_items', 'calc_line_total_cents')) {
            DB::statement('
                ALTER TABLE invoice_items
                ADD COLUMN calc_line_total_cents BIGINT
                GENERATED ALWAYS AS (qty * unit_price_cents) STORED
            ');
        }

        DB::statement('
            ALTER TABLE invoice_items
            ADD CONSTRAINT chk_invoice_items_calc_total
            CHECK (line_total_cents = calc_line_total_cents)
        ');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE invoice_items DROP CHECK chk_invoice_items_calc_total');

        if ($this->columnExists('invoice_items', 'calc_line_total_cents')) {
            DB::statement('ALTER TABLE invoice_items DROP COLUMN calc_line_total_cents');
        }
    }

    private function columnExists(string $table, string $column): bool
    {
        $database = DB::getDatabaseName();

        $result = DB::selectOne(
            'SELECT COUNT(*) AS total
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$database, $table, $column]
        );

        return (int) ($result->total ?? 0) > 0;
    }
};

