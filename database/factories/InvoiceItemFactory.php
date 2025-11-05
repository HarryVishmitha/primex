<?php

namespace Database\Factories;

use App\Models\InvoiceItem;
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
}
