<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE invoices
            ADD CONSTRAINT chk_invoices_nonneg
            CHECK (subtotal_cents >= 0 AND discount_cents >= 0 AND tax_cents >= 0 AND total_cents >= 0)");

        DB::statement("ALTER TABLE invoice_items
            ADD CONSTRAINT chk_invoice_items_nonneg
            CHECK (qty > 0 AND unit_price_cents >= 0 AND line_total_cents >= 0)");

        DB::statement("ALTER TABLE payments
            ADD CONSTRAINT chk_payments_nonneg
            CHECK (amount_cents >= 0)");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE invoices DROP CHECK chk_invoices_nonneg');
        DB::statement('ALTER TABLE invoice_items DROP CHECK chk_invoice_items_nonneg');
        DB::statement('ALTER TABLE payments DROP CHECK chk_payments_nonneg');
    }
};

