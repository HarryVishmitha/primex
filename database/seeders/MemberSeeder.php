<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Member;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /** @var list<string> */
    public static array $memberIds = [];

    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId ?? Tenant::query()->firstOrFail()->id;
        $branches = BranchSeeder::$branchIds;

        if ($branches === []) {
            $branches = Branch::query()
                ->where('tenant_id', $tenantId)
                ->pluck('id')
                ->all();
        }

        $memberUser = User::factory()->create([
            'tenant_id' => $tenantId,
            'branch_id' => $branches[0] ?? null,
            'name' => 'Primex Member',
            'email' => 'member@primex.test',
        ]);
        $memberUser->assignRole('Member');

        $primaryMember = Member::factory()->create([
            'tenant_id' => $tenantId,
            'user_id' => $memberUser->id,
            'branch_id' => $branches[0] ?? null,
            'status' => 'active',
        ]);

        self::$memberIds[] = $primaryMember->id;

        foreach (range(1, 20) as $i) {
            $branchId = collect($branches)->random();

            $user = User::factory()->create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
            ]);
            $user->assignRole('Member');

            $member = Member::factory()->create([
                'tenant_id' => $tenantId,
                'user_id' => $user->id,
                'branch_id' => $branchId,
                'status' => 'active',
            ]);

            self::$memberIds[] = $member->id;
        }
    }
}
