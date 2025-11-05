<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassWaitlist extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'schedule_id',
        'member_id',
        'position',
        'notified_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'schedule_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'notified_at' => 'datetime',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(ClassSchedule::class, 'schedule_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function scopePendingNotification($query)
    {
        return $query->whereNull('notified_at');
    }
}

