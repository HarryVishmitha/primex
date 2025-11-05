<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Events\SubscriptionActivated;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends TenantModel
{
    protected $with = ['member', 'plan'];

    protected $fillable = [
        'tenant_id',
        'member_id',
        'plan_id',
        'starts_at',
        'ends_at',
        'status',
        'auto_renew',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'plan_id' => AsUlidString::class,
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'auto_renew' => 'boolean',
    ];

    protected $appends = [
        'status_label',
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (Subscription $subscription) {
            if ($subscription->wasChanged('status') && $subscription->status === 'active') {
                SubscriptionActivated::dispatch($subscription);
            }
        });
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForMember($query, string $memberId)
    {
        return $query->where('member_id', $memberId);
    }

    public function scopeUpcomingExpiry($query, int $days = 7)
    {
        return $query->whereBetween('ends_at', [now(), now()->addDays($days)]);
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('starts_at', [$from, $to]);
    }

    public function getStatusLabelAttribute(): string
    {
        return ucfirst($this->status);
    }

    public function duration(): ?CarbonInterval
    {
        if (! $this->starts_at || ! $this->ends_at) {
            return null;
        }

        return $this->starts_at->diffAsCarbonInterval($this->ends_at);
    }
}

