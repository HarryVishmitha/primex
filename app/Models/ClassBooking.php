<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Events\ClassBooked;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ClassBooking extends TenantModel
{
    use LogsActivity;
    protected $fillable = [
        'tenant_id',
        'schedule_id',
        'member_id',
        'status',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'schedule_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
    ];

    protected $appends = [
        'status_label',
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::created(function (ClassBooking $booking) {
            ClassBooked::dispatch($booking);
        });
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(ClassSchedule::class, 'schedule_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function scopeForMember($query, string $memberId)
    {
        return $query->where('member_id', $memberId);
    }

    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function getStatusLabelAttribute(): string
    {
        return str_replace('_', ' ', ucfirst($this->status));
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['schedule_id', 'member_id', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Class booking {$eventName}")
            ->useLogName('class_booking');
    }
}

