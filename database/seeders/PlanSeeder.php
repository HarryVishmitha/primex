<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /** @var list<string> */
    public static array $planIds = [];

    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId;

        $plans = Plan::factory()
            ->count(3)
            ->state(fn () => ['tenant_id' => $tenantId])
            ->create();

        self::$planIds = $plans->pluck('id')->all();
    }
}
