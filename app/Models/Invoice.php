<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends TenantModel
{
    protected $with = ['member', 'items'];

    protected $fillable = [
        'tenant_id',
        'member_id',
        'number',
        'status',
        'subtotal_cents',
        'discount_cents',
        'tax_cents',
        'total_cents',
        'issued_at',
        'due_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'subtotal_cents' => MoneyCast::class,
        'discount_cents' => MoneyCast::class,
        'tax_cents' => MoneyCast::class,
        'total_cents' => MoneyCast::class,
        'issued_at' => 'datetime',
        'due_at' => 'datetime',
    ];

    protected $appends = [
        'total_formatted',
        'status_label',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function getTotalFormattedAttribute(): string
    {
        return $this->total_cents?->format() ?? 'LKR 0.00';
    }

    public function getStatusLabelAttribute(): string
    {
        return ucfirst($this->status);
    }
}

