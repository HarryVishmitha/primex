<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberMealPlan extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'member_id',
        'template_id',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'template_id' => AsUlidString::class,
        'starts_at' => 'date',
        'ends_at' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(MealPlanTemplate::class, 'template_id');
    }

    public function scopeActive($query)
    {
        return $query->whereDate('starts_at', '<=', today())
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhereDate('ends_at', '>=', today());
            });
    }
}

