<?php

namespace Database\Factories;

use App\Models\InvoiceItem;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    protected $model = InvoiceItem::class;

    public function definition(): array
    {
        $qty = $this->faker->numberBetween(1, 5);
        $unit = $this->faker->numberBetween(1000, 7000);

        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'invoice_id' => (string) Str::ulid(),
            'item_type' => $this->faker->randomElement(['plan', 'class', 'pos', 'fee']),
            'ref_id' => null,
            'name' => ucfirst($this->faker->words(3, true)),
            'qty' => $qty,
            'unit_price_cents' => $unit,
            'line_total_cents' => $qty * $unit,
        ];
    }

    public function forPlan(Plan $plan): static
    {
        return $this->state(function (array $attributes) use ($plan) {
            $qty = $attributes['qty'] ?? 1;
            $unit = (int) data_get($plan->getAttributes(), 'price_cents', 0);

            return [
                'tenant_id' => $plan->tenant_id,
                'item_type' => 'plan',
                'ref_id' => $plan->id,
                'name' => $plan->name,
                'qty' => $qty,
                'unit_price_cents' => $unit,
                'line_total_cents' => $qty * $unit,
            ];
        });
    }
}
