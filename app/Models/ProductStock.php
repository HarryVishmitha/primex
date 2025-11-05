<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductStock extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'product_id',
        'branch_id',
        'on_hand',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'product_id' => AsUlidString::class,
        'branch_id' => AsUlidString::class,
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::addGlobalScope(new BranchScope());
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function scopeForProduct($query, string $productId)
    {
        return $query->where('product_id', $productId);
    }
}

