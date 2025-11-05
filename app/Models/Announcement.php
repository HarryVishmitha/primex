<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;

class Announcement extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'title',
        'body',
        'audience',
        'publish_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'publish_at' => 'datetime',
    ];

    public function scopeForAudience($query, string $audience)
    {
        return $query->where('audience', $audience);
    }

    public function scopePublished($query)
    {
        return $query->where('publish_at', '<=', now());
    }
}

