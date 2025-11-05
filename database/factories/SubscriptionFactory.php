<?php

namespace Database\Factories;

use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        $start = Carbon::now()->subDays($this->faker->numberBetween(0, 30));
        $end = (clone $start)->addDays($this->faker->numberBetween(30, 90));

        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'member_id' => (string) Str::ulid(),
            'plan_id' => (string) Str::ulid(),
            'starts_at' => $start,
            'ends_at' => $end,
            'status' => 'active',
            'auto_renew' => $this->faker->boolean(),
        ];
    }
}
