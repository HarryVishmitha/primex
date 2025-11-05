<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meal extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'template_day_id',
        'name',
        'kcal',
        'macros',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'template_day_id' => AsUlidString::class,
        'macros' => AsArrayObject::class,
    ];

    public function templateDay(): BelongsTo
    {
        return $this->belongsTo(MealTemplateDay::class, 'template_day_id');
    }
}

