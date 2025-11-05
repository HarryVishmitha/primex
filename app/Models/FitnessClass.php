<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FitnessClass extends TenantModel
{
    protected $table = 'classes';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'category_id',
        'title',
        'description',
        'capacity',
        'level',
        'status',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'branch_id' => AsUlidString::class,
        'category_id' => AsUlidString::class,
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::addGlobalScope(new BranchScope());
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ClassCategory::class, 'category_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ClassSchedule::class, 'class_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'published');
    }
}

