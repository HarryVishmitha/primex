<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Spatie\Activitylog\Models\Activity as BaseActivity;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Activity extends BaseActivity
{
    use BelongsToTenant;

    protected $casts = [
        'tenant_id' => AsUlidString::class,
    ];
}
