<?php

namespace Database\Factories;

use App\Models\ClassCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ClassCategory>
 */
class ClassCategoryFactory extends Factory
{
    protected $model = ClassCategory::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'name' => ucfirst($this->faker->unique()->word()),
            'status' => 'active',
        ];
    }
}
