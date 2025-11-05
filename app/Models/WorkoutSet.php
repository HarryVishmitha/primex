<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutSet extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'session_id',
        'exercise_id',
        'set_no',
        'reps',
        'weight_kg',
        'rpe',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'session_id' => AsUlidString::class,
        'exercise_id' => AsUlidString::class,
        'weight_kg' => 'decimal:2',
        'rpe' => 'decimal:1',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class, 'session_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function scopeForExercise($query, string $exerciseId)
    {
        return $query->where('exercise_id', $exerciseId);
    }
}

