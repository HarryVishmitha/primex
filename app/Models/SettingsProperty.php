<?php

declare(strict_types=1);

namespace App\Models;

use Spatie\LaravelSettings\Models\SettingsProperty as BaseSettingsProperty;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class SettingsProperty extends BaseSettingsProperty
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'group',
        'name',
        'payload',
        'locked',
    ];
}

