<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\InvoiceItem;

class InvoiceItemObserver
{
    public function creating(InvoiceItem $item): void
    {
        $this->syncLineTotal($item);
    }

    public function updating(InvoiceItem $item): void
    {
        $this->syncLineTotal($item);
    }

    private function syncLineTotal(InvoiceItem $item): void
    {
        $discount = (int) ($item->getAttribute('line_discount_cents') ?? 0);
        $item->line_total_cents = max(
            0,
            ($item->qty * $item->unit_price_cents) - $discount
        );
    }
}
