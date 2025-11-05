<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant
{
    use HasFactory;

    protected $fillable = [
        'id',
        'code',
        'name',
        'status',
        'data',
    ];

    protected $casts = [
        'id' => 'string',
        'data' => 'array',
    ];

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'code',
            'name',
            'status',
            'created_at',
            'updated_at',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }
}
