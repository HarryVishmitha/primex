<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BodyMeasurement extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'member_id',
        'measured_at',
        'weight_kg',
        'height_cm',
        'body_fat_pct',
        'chest_cm',
        'waist_cm',
        'hips_cm',
        'arm_cm',
        'thigh_cm',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'measured_at' => 'date',
        'weight_kg' => 'decimal:2',
        'height_cm' => 'decimal:2',
        'body_fat_pct' => 'decimal:2',
        'chest_cm' => 'decimal:2',
        'waist_cm' => 'decimal:2',
        'hips_cm' => 'decimal:2',
        'arm_cm' => 'decimal:2',
        'thigh_cm' => 'decimal:2',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('measured_at', [$from, $to]);
    }
}

