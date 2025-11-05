<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosSaleItem extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'sale_id',
        'product_id',
        'qty',
        'unit_price_cents',
        'line_total_cents',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'sale_id' => AsUlidString::class,
        'product_id' => AsUlidString::class,
        'unit_price_cents' => MoneyCast::class,
        'line_total_cents' => MoneyCast::class,
    ];

    protected $appends = [
        'line_total_formatted',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(PosSale::class, 'sale_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getLineTotalFormattedAttribute(): string
    {
        return $this->line_total_cents?->format() ?? 'LKR 0.00';
    }
}

