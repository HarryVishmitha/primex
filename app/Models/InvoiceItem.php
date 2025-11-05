<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'invoice_id',
        'item_type',
        'ref_id',
        'name',
        'qty',
        'unit_price_cents',
        'line_total_cents',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'invoice_id' => AsUlidString::class,
        'ref_id' => AsUlidString::class,
        'unit_price_cents' => MoneyCast::class,
        'line_total_cents' => MoneyCast::class,
    ];

    protected $appends = [
        'line_total_formatted',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function getLineTotalFormattedAttribute(): string
    {
        return $this->line_total_cents?->format() ?? 'LKR 0.00';
    }
}

