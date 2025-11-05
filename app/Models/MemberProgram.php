<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberProgram extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'member_id',
        'program_id',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'program_id' => AsUlidString::class,
        'starts_at' => 'date',
        'ends_at' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function scopeActive($query)
    {
        return $query->whereDate('starts_at', '<=', today())
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhereDate('ends_at', '>=', today());
            });
    }
}

