<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassSchedule extends TenantModel
{
    protected $with = ['class', 'trainer'];

    protected $fillable = [
        'tenant_id',
        'class_id',
        'trainer_id',
        'starts_at',
        'ends_at',
        'room',
        'recurrence',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'class_id' => AsUlidString::class,
        'trainer_id' => AsUlidString::class,
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'recurrence' => AsArrayObject::class,
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(FitnessClass::class, 'class_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(ClassBooking::class, 'schedule_id');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('starts_at', '>=', now());
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('starts_at', [$from, $to]);
    }
}

