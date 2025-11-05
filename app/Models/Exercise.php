<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercise extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'name',
        'muscle_group',
        'equipment',
        'metadata',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'metadata' => AsArrayObject::class,
    ];

    public function workoutSets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class);
    }

    public function scopeForMuscleGroup($query, string $group)
    {
        return $query->where('muscle_group', $group);
    }
}

