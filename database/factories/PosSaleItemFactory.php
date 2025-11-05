<?php

namespace Database\Factories;

use App\Models\PosSaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PosSaleItem>
 */
class PosSaleItemFactory extends Factory
{
    protected $model = PosSaleItem::class;

    public function definition(): array
    {
        $qty = $this->faker->numberBetween(1, 5);
        $unit = $this->faker->numberBetween(500, 5000);

        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'sale_id' => (string) Str::ulid(),
            'product_id' => (string) Str::ulid(),
            'qty' => $qty,
            'unit_price_cents' => $unit,
            'line_total_cents' => $qty * $unit,
        ];
    }
}
