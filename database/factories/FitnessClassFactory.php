<?php

namespace Database\Factories;

use App\Models\FitnessClass;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FitnessClass>
 */
class FitnessClassFactory extends Factory
{
    protected $model = FitnessClass::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'branch_id' => (string) Str::ulid(),
            'category_id' => (string) Str::ulid(),
            'title' => ucfirst($this->faker->words(3, true)),
            'description' => $this->faker->paragraph(),
            'capacity' => $this->faker->numberBetween(10, 30),
            'level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'status' => 'published',
        ];
    }
}
