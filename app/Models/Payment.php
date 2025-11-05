<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use App\Casts\MoneyCast;
use App\Events\PaymentSucceeded;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends TenantModel
{
    protected $with = ['invoice'];

    protected $fillable = [
        'tenant_id',
        'invoice_id',
        'subscription_id',
        'member_id',
        'method',
        'amount_cents',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'invoice_id' => AsUlidString::class,
        'subscription_id' => AsUlidString::class,
        'member_id' => AsUlidString::class,
        'amount_cents' => MoneyCast::class,
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'amount_formatted',
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (Payment $payment) {
            if ($payment->wasChanged('status') && $payment->status === 'succeeded') {
                PaymentSucceeded::dispatch($payment);
            }
        });
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopeForMember($query, string $memberId)
    {
        return $query->where('member_id', $memberId);
    }

    public function scopeBetween($query, $from, $to)
    {
        return $query->whereBetween('paid_at', [$from, $to]);
    }

    public function getAmountFormattedAttribute(): string
    {
        return $this->amount_cents?->format() ?? 'LKR 0.00';
    }
}

