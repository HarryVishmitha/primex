<?php

use App\Models\Branch;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Member;
use App\Models\Plan;
use App\Models\Tenant;
use Database\Seeders\Patches\FixInvoiceMath;

function createFinanceContext(): array
{
    /** @var Tenant $tenant */
    $tenant = Tenant::factory()->create();

    /** @var Branch $branch */
    $branch = Branch::factory()->create([
        'tenant_id' => $tenant->id,
    ]);

    /** @var Member $member */
    $member = Member::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    /** @var Plan $plan */
    $plan = Plan::factory()->create([
        'tenant_id' => $tenant->id,
        'status' => 'active',
        'duration_days' => 30,
        'price_cents' => 5_000,
    ]);

    /** @var Invoice $invoice */
    $invoice = Invoice::factory()->create([
        'tenant_id' => $tenant->id,
        'member_id' => $member->id,
        'number' => 'INV-TEST-001',
        'status' => 'issued',
        'subtotal_cents' => 0,
        'discount_cents' => 0,
        'tax_cents' => 0,
        'total_cents' => 0,
    ]);

    return compact('tenant', 'branch', 'member', 'plan', 'invoice');
}

it('recomputes invoice item line totals via observer', function () {
    $context = createFinanceContext();

    /** @var InvoiceItem $item */
    $item = InvoiceItem::factory()->create([
        'tenant_id' => $context['tenant']->id,
        'invoice_id' => $context['invoice']->id,
        'item_type' => 'plan',
        'ref_id' => $context['plan']->id,
        'qty' => 3,
        'unit_price_cents' => 2_000,
        'line_total_cents' => 1, // observer should correct this
    ]);

    expect($item->fresh()->line_total_cents)->toBe(6_000);
});

it('patch seeder reconciles invoice aggregates', function () {
    $context = createFinanceContext();

    /** @var InvoiceItem $item */
    $item = InvoiceItem::factory()->create([
        'tenant_id' => $context['tenant']->id,
        'invoice_id' => $context['invoice']->id,
        'item_type' => 'plan',
        'ref_id' => $context['plan']->id,
        'qty' => 2,
        'unit_price_cents' => 4_000,
        'line_total_cents' => 8_000,
    ]);

    $item->forceFill(['line_total_cents' => 100])->saveQuietly();
    $context['invoice']->forceFill([
        'subtotal_cents' => 50,
        'total_cents' => 50,
    ])->saveQuietly();

    app(FixInvoiceMath::class)->run();

    $item->refresh();
    $context['invoice']->refresh();

    $invoiceAttributes = $context['invoice']->getAttributes();

    expect($item->line_total_cents)->toBe(8_000)
        ->and((int) $invoiceAttributes['subtotal_cents'])->toBe(8_000)
        ->and((int) $invoiceAttributes['total_cents'])->toBe(8_000);
});
