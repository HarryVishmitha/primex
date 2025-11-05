<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'name',
        'duration_days',
        'price_cents',
        'access_rules',
        'status',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'price_cents' => MoneyCast::class,
        'access_rules' => AsArrayObject::class,
    ];

    protected $appends = [
        'price_formatted',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
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

