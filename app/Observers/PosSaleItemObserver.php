<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\PosSaleItem;

class PosSaleItemObserver
{
    public function creating(PosSaleItem $item): void
    {
        $this->syncLineTotal($item);
    }

    public function updating(PosSaleItem $item): void
    {
        $this->syncLineTotal($item);
    }

    private function syncLineTotal(PosSaleItem $item): void
    {
        $item->line_total_cents = $item->qty * $item->unit_price_cents;
    }
}

