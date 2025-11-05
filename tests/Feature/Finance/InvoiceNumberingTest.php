<?php

use App\Models\Branch;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Tenant;
use Illuminate\Database\QueryException;

function createTenantMember(string $number = 'INV-001'): array
{
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);
    $member = Member::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    $invoice = Invoice::factory()->create([
        'tenant_id' => $tenant->id,
        'member_id' => $member->id,
        'number' => $number,
        'status' => 'issued',
        'subtotal_cents' => 1_000,
        'discount_cents' => 0,
        'tax_cents' => 0,
        'total_cents' => 1_000,
    ]);

    return compact('tenant', 'member', 'invoice');
}

it('allows duplicate invoice numbers across tenants', function () {
    $first = createTenantMember('INV-SHARED');
    $second = createTenantMember('INV-SHARED');

    expect(Invoice::query()->where('number', 'INV-SHARED')->count())->toBe(2);
});

it('rejects duplicate invoice numbers within the same tenant', function () {
    $context = createTenantMember('INV-DUP');

    expect(fn () => Invoice::factory()->create([
        'tenant_id' => $context['tenant']->id,
        'member_id' => $context['member']->id,
        'number' => 'INV-DUP',
        'status' => 'issued',
        'subtotal_cents' => 1_000,
        'discount_cents' => 0,
        'tax_cents' => 0,
        'total_cents' => 1_000,
    ]))->toThrow(QueryException::class);
});
