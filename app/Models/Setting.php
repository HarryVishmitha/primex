<?php

declare(strict_types=1);

namespace App\Models;

class Setting extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'key',
        'value',
    ];

    protected $casts = [
        'value' => 'array',
    ];
}

