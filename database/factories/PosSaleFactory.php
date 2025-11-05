<?php

namespace Database\Factories;

use App\Models\PosSale;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PosSale>
 */
class PosSaleFactory extends Factory
{
    protected $model = PosSale::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'branch_id' => (string) Str::ulid(),
            'member_id' => null,
            'number' => strtoupper($this->faker->unique()->bothify('POS-#####')),
            'total_cents' => $this->faker->numberBetween(2000, 10000),
            'paid_at' => now()->subDays($this->faker->numberBetween(0, 30)),
        ];
    }
}
