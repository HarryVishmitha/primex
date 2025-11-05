<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'category_id' => (string) Str::ulid(),
            'sku' => strtoupper($this->faker->unique()->bothify('SKU###')),
            'name' => ucfirst($this->faker->words(3, true)),
            'unit' => $this->faker->randomElement(['pcs', 'bottle', 'packet']),
            'price_cents' => $this->faker->numberBetween(1000, 15000),
            'tax_rate' => $this->faker->randomElement([0, 8, 15]),
            'status' => 'active',
        ];
    }
}
