<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'payment_id',
        'amount_cents',
        'reason',
        'refunded_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'payment_id' => AsUlidString::class,
        'amount_cents' => MoneyCast::class,
        'refunded_at' => 'datetime',
    ];

    protected $appends = [
        'amount_formatted',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('refunded_at', [$from, $to]);
    }

    public function getAmountFormattedAttribute(): string
    {
        return $this->amount_cents?->format() ?? 'LKR 0.00';
    }
}

