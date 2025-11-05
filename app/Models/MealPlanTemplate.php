<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MealPlanTemplate extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'name',
        'goal',
        'kcal_target',
        'macros',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'macros' => AsArrayObject::class,
    ];

    public function days(): HasMany
    {
        return $this->hasMany(MealTemplateDay::class, 'template_id');
    }

    public function memberMealPlans(): HasMany
    {
        return $this->hasMany(MemberMealPlan::class, 'template_id');
    }
}

