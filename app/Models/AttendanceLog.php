<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class AttendanceLog extends TenantModel
{
    use LogsActivity;
    protected $fillable = [
        'tenant_id',
        'member_id',
        'branch_id',
        'checked_in_at',
        'checked_out_at',
        'source',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'branch_id' => AsUlidString::class,
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::addGlobalScope(new BranchScope());
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function scopeOpen($query)
    {
        return $query->whereNull('checked_out_at');
    }

    public function scopeForMember($query, string $memberId)
    {
        return $query->where('member_id', $memberId);
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('checked_in_at', [$from, $to]);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['member_id', 'branch_id', 'checked_in_at', 'checked_out_at', 'source'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Attendance {$eventName}")
            ->useLogName('attendance');
    }
}

