<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutSession extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'member_id',
        'program_id',
        'performed_at',
        'notes',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'program_id' => AsUlidString::class,
        'performed_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function sets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class, 'session_id');
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('performed_at', [$from, $to]);
    }
}

