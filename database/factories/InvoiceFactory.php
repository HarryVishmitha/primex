<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $subtotal = $this->faker->numberBetween(5000, 20000);
        $discount = $this->faker->boolean(20) ? $this->faker->numberBetween(0, 1000) : 0;
        $tax = (int) round(($subtotal - $discount) * 0.08);
        $total = $subtotal - $discount + $tax;

        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'member_id' => (string) Str::ulid(),
            'number' => strtoupper($this->faker->unique()->bothify('INV-#####')),
            'status' => $this->faker->randomElement(['draft', 'issued', 'paid']),
            'subtotal_cents' => $subtotal,
            'discount_cents' => $discount,
            'tax_cents' => $tax,
            'total_cents' => $total,
            'issued_at' => now(),
            'due_at' => now()->addDays(7),
        ];
    }
}
