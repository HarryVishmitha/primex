<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(['pending', 'succeeded', 'failed']);
        $paidAt = $status === 'succeeded' ? now()->subDays($this->faker->numberBetween(0, 10)) : null;

        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'invoice_id' => (string) Str::ulid(),
            'subscription_id' => null,
            'member_id' => (string) Str::ulid(),
            'method' => $this->faker->randomElement(['cash', 'card', 'online', 'bank_transfer']),
            'amount_cents' => $this->faker->numberBetween(5000, 25000),
            'status' => $status,
            'paid_at' => $paidAt,
        ];
    }
}
