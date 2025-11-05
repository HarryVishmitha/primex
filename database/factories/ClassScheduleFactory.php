<?php

namespace Database\Factories;

use App\Models\ClassSchedule;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ClassSchedule>
 */
class ClassScheduleFactory extends Factory
{
    protected $model = ClassSchedule::class;

    public function definition(): array
    {
        $start = Carbon::now()->addDays($this->faker->numberBetween(1, 14))->setTime($this->faker->numberBetween(6, 20), 0);
        $end = (clone $start)->addHour();

        return [
            'id' => (string) Str::ulid(),
            'tenant_id' => (string) Str::ulid(),
            'class_id' => (string) Str::ulid(),
            'trainer_id' => (string) Str::ulid(),
            'starts_at' => $start,
            'ends_at' => $end,
            'room' => 'Studio '.$this->faker->randomElement(['A', 'B', 'C']),
            'recurrence' => null,
        ];
    }
}
