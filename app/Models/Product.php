<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends TenantModel
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'sku',
        'name',
        'unit',
        'price_cents',
        'tax_rate',
        'status',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'category_id' => AsUlidString::class,
        'price_cents' => MoneyCast::class,
        'tax_rate' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'price_formatted',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(ProductStock::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(PosSaleItem::class, 'product_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function getPriceFormattedAttribute(): string
    {
        return $this->price_cents?->format() ?? 'LKR 0.00';
    }
}

