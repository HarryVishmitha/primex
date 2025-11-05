<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Media extends BaseMedia
{
    use BelongsToTenant;

    protected $casts = [
        'tenant_id' => AsUlidString::class,
    ];
}
