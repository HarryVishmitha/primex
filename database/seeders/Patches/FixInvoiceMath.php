<?php

namespace Database\Seeders\Patches;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FixInvoiceMath extends Seeder
{
    public function run(): void
    {
        DB::table('invoice_items')->update([
            'line_total_cents' => DB::raw('qty * unit_price_cents'),
        ]);

        DB::statement("
            UPDATE invoices i
            JOIN (
                SELECT invoice_id, SUM(line_total_cents) AS subtotal
                FROM invoice_items
                GROUP BY invoice_id
            ) AS s ON s.invoice_id = i.id
            SET i.subtotal_cents = s.subtotal,
                i.total_cents = s.subtotal - i.discount_cents + i.tax_cents
        ");
    }
}

