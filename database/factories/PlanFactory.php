<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'name' => $this->faker->unique()->words(2, true).' Plan',
            'duration_days' => $this->faker->randomElement([30, 60, 90, 180, 365]),
            'price_cents' => $this->faker->numberBetween(5000, 50000),
            'access_rules' => [
                'gym' => true,
                'classes_per_week' => $this->faker->numberBetween(2, 7),
            ],
            'status' => 'active',
        ];
    }
}
