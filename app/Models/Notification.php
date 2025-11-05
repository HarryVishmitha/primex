<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'title',
        'body',
        'read_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'user_id' => AsUlidString::class,
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}

