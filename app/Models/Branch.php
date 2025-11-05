<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'name',
        'address',
        'phone',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}

