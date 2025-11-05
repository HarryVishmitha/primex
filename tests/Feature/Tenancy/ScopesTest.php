<?php

use App\Models\Branch;
use App\Models\Member;
use App\Models\Tenant;

it('applies tenant and branch scopes for isolated queries', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $branchA1 = Branch::factory()->create(['tenant_id' => $tenantA->id]);
    $branchA2 = Branch::factory()->create(['tenant_id' => $tenantA->id]);
    $branchB = Branch::factory()->create(['tenant_id' => $tenantB->id]);

    $memberA1 = Member::factory()->create([
        'tenant_id' => $tenantA->id,
        'branch_id' => $branchA1->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    $memberA2 = Member::factory()->create([
        'tenant_id' => $tenantA->id,
        'branch_id' => $branchA2->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    Member::factory()->create([
        'tenant_id' => $tenantB->id,
        'branch_id' => $branchB->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    tenancy()->initialize($tenantA);
    app()->instance('branch.context', $branchA1->id);

    $visibleMembers = Member::query()->pluck('id')->all();

    expect($visibleMembers)
        ->toContain($memberA1->id)
        ->not->toContain($memberA2->id);

    tenancy()->end();
    app()->forgetInstance('branch.context');
});

