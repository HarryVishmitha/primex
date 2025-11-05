<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(['active', 'inactive', 'suspended', 'prospect']);

        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'user_id' => null,
            'branch_id' => (string) Str::ulid(),
            'code' => strtoupper($this->faker->unique()->bothify('MBR###')),
            'full_name' => $this->faker->name(),
            'gender' => $this->faker->randomElement(['male', 'female', 'non_binary', 'undisclosed']),
            'dob' => $this->faker->optional()->dateTimeBetween('-60 years', '-16 years'),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->boolean(80) ? $this->faker->unique()->safeEmail() : null,
            'status' => $status,
            'emergency_contact' => [
                'name' => $this->faker->name(),
                'phone' => $this->faker->phoneNumber(),
                'relationship' => $this->faker->randomElement(['Parent', 'Sibling', 'Friend']),
            ],
        ];
    }
}
