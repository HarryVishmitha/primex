<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId;
        $memberIds = collect(MemberSeeder::$memberIds)->shuffle()->take(10);
        $plans = Plan::query()->where('tenant_id', $tenantId)->get();

        foreach ($memberIds as $memberId) {
            if ($plans->isEmpty()) {
                break;
            }

            $plan = $plans->random();
            $planAmount = (int) Arr::get($plan->getAttributes(), 'price_cents', 0);
            $qty = 1;
            $tax = (int) round($planAmount * 0.08);
            $lineTotal = $qty * $planAmount;
            $total = $lineTotal + $tax;

            $invoice = Invoice::factory()->create([
                'tenant_id' => $tenantId,
                'member_id' => $memberId,
                'status' => 'paid',
                'subtotal_cents' => $lineTotal,
                'discount_cents' => 0,
                'tax_cents' => $tax,
                'total_cents' => $total,
                'issued_at' => Carbon::now()->subDays(rand(0, 7)),
                'due_at' => Carbon::now()->addDays(7),
            ]);

            InvoiceItem::query()->create([
                'tenant_id' => $tenantId,
                'invoice_id' => $invoice->id,
                'item_type' => 'plan',
                'ref_id' => $plan->id,
                'name' => $plan->name,
                'qty' => $qty,
                'unit_price_cents' => $planAmount,
                'line_total_cents' => $lineTotal,
            ]);

            Payment::factory()->create([
                'tenant_id' => $tenantId,
                'invoice_id' => $invoice->id,
                'member_id' => $memberId,
                'amount_cents' => $total,
                'status' => 'succeeded',
                'paid_at' => Carbon::now(),
            ]);
        }
    }
}
