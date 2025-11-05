<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    public static array $branchIds = [];

    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId ?? Tenant::query()->firstOrFail()->id;

        self::$branchIds = Branch::factory()
            ->count(2)
            ->state(fn () => ['tenant_id' => $tenantId])
            ->create()
            ->pluck('id')
            ->all();
    }
}
