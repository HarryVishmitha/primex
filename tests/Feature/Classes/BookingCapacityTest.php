<?php

use App\Domain\Classes\BookClass;
use App\Models\Branch;
use App\Models\ClassBooking;
use App\Models\ClassCategory;
use App\Models\ClassSchedule;
use App\Models\FitnessClass;
use App\Models\Member;
use App\Models\Tenant;
use App\Models\User;
use DomainException;

it('prevents booking beyond class capacity', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $category = ClassCategory::factory()->create([
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);

    $trainer = User::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
    ]);

    $fitnessClass = FitnessClass::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'category_id' => $category->id,
        'capacity' => 1,
        'status' => 'published',
    ]);

    $schedule = ClassSchedule::factory()->create([
        'tenant_id' => $tenant->id,
        'class_id' => $fitnessClass->id,
        'trainer_id' => $trainer->id,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHour(),
    ])->load('class');

    $memberOne = Member::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    $memberTwo = Member::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    $bookClass = app(BookClass::class);

    $booking = $bookClass($schedule, $memberOne);

    expect($booking)
        ->toBeInstanceOf(ClassBooking::class)
        ->and($booking->status)->toBe('reserved');

    $schedule->refresh()->load('class');

    expect(fn () => $bookClass($schedule, $memberTwo))->toThrow(DomainException::class);
});

