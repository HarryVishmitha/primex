<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MealTemplateDay extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'template_id',
        'day_no',
        'notes',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'template_id' => AsUlidString::class,
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(MealPlanTemplate::class, 'template_id');
    }

    public function meals(): HasMany
    {
        return $this->hasMany(Meal::class, 'template_day_id');
    }
}

