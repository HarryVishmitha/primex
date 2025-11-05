<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use App\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosSale extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'branch_id',
        'member_id',
        'number',
        'total_cents',
        'paid_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'branch_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'total_cents' => MoneyCast::class,
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'total_formatted',
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::addGlobalScope(new BranchScope());
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PosSaleItem::class, 'sale_id');
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('paid_at', [$from, $to]);
    }

    public function getTotalFormattedAttribute(): string
    {
        return $this->total_cents?->format() ?? 'LKR 0.00';
    }
}

