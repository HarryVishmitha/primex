<?php

use App\Domain\Subscriptions\ActivateSubscription;
use App\Models\Branch;
use App\Models\Member;
use App\Models\Plan;
use App\Models\Tenant;
use DomainException;

it('activates a subscription and prevents duplicates', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $member = Member::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    $plan = Plan::factory()->create([
        'tenant_id' => $tenant->id,
        'status' => 'active',
        'duration_days' => 30,
        'price_cents' => 10_000,
    ]);

    $activate = app(ActivateSubscription::class);

    $subscription = $activate($member, $plan);

    expect($subscription->status)->toBe('active')
        ->and($subscription->tenant_id)->toBe($tenant->id)
        ->and($subscription->member_id)->toBe($member->id)
        ->and($subscription->plan_id)->toBe($plan->id)
        ->and($subscription->starts_at)->not->toBeNull()
        ->and($subscription->ends_at)->not->toBeNull();

    expect(fn () => $activate($member, $plan))->toThrow(DomainException::class);
});

