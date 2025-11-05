<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'title' => ucfirst($this->faker->sentence(6)),
            'body' => $this->faker->paragraphs(2, true),
            'audience' => $this->faker->randomElement(['all', 'members', 'staff']),
            'publish_at' => now(),
        ];
    }
}
