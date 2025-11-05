<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassCategory extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'name',
        'status',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
    ];

    public function classes(): HasMany
    {
        return $this->hasMany(FitnessClass::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

