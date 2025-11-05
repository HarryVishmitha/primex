<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use App\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Member extends TenantModel
{
    use SoftDeletes;
    use LogsActivity;

    protected $with = ['branch'];

    protected $fillable = [
        'tenant_id',
        'user_id',
        'branch_id',
        'code',
        'full_name',
        'gender',
        'dob',
        'phone',
        'email',
        'status',
        'emergency_contact',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'user_id' => AsUlidString::class,
        'branch_id' => AsUlidString::class,
        'dob' => 'date',
        'emergency_contact' => AsArrayObject::class,
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'status_label',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForBranch($query, string $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'active' => 'Active',
            'inactive' => 'Inactive',
            'suspended' => 'Suspended',
            default => 'Prospect',
        };
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['full_name', 'email', 'phone', 'status', 'branch_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Member {$eventName}")
            ->useLogName('member');
    }
}
