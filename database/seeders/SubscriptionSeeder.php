<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId;
        $memberIds = MemberSeeder::$memberIds;
        $plans = Plan::query()->where('tenant_id', $tenantId)->get();

        foreach ($memberIds as $memberId) {
            if ($plans->isEmpty()) {
                continue;
            }

            $plan = $plans->random();
            $startsAt = Carbon::now()->subDays(rand(0, 14));
            $endsAt = (clone $startsAt)->addDays($plan->duration_days ?? 30);

            Subscription::factory()->create([
                'tenant_id' => $tenantId,
                'member_id' => $memberId,
                'plan_id' => $plan->id,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'status' => 'active',
            ]);
        }
    }
}
