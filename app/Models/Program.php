<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'title',
        'description',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
    ];

    public function memberPrograms(): HasMany
    {
        return $this->hasMany(MemberProgram::class);
    }
}

