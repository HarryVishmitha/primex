<?php

declare(strict_types=1);

namespace App\Domain\Subscriptions;

use App\Models\Member;
use App\Models\Plan;
use App\Models\Subscription;
use DomainException;
use Illuminate\Support\Facades\DB;

class ActivateSubscription
{
    public function __invoke(Member $member, Plan $plan, bool $autoRenew = false): Subscription
    {
        return DB::transaction(function () use ($member, $plan, $autoRenew) {
            $hasActiveSubscription = Subscription::query()
                ->where('tenant_id', $member->tenant_id)
                ->where('member_id', $member->id)
                ->where('status', 'active')
                ->lockForUpdate()
                ->exists();

            if ($hasActiveSubscription) {
                throw new DomainException('Member already has an active subscription.');
            }

            $durationDays = max(1, (int) $plan->getAttribute('duration_days'));
            $startsAt = now();
            $endsAt = $startsAt->clone()->addDays($durationDays);

            return Subscription::create([
                'tenant_id' => $member->tenant_id,
                'member_id' => $member->id,
                'plan_id' => $plan->id,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'status' => 'active',
                'auto_renew' => $autoRenew,
            ]);
        });
    }
}
