<?php

declare(strict_types=1);

namespace App\Domain\Classes;

use App\Models\ClassBooking;
use App\Models\ClassSchedule;
use App\Models\Member;
use DomainException;
use Illuminate\Support\Facades\DB;

class BookClass
{
    public function __invoke(ClassSchedule $schedule, Member $member): ClassBooking
    {
        return DB::transaction(function () use ($schedule, $member) {
            $activeCount = ClassBooking::query()
                ->where('tenant_id', $schedule->tenant_id)
                ->where('schedule_id', $schedule->id)
                ->whereIn('status', ['reserved', 'checked_in'])
                ->lockForUpdate()
                ->count();

            $capacity = (int) optional($schedule->class)->capacity;

            if ($capacity > 0 && $activeCount >= $capacity) {
                throw new DomainException('Class capacity reached.');
            }

            return ClassBooking::create([
                'tenant_id' => $schedule->tenant_id,
                'schedule_id' => $schedule->id,
                'member_id' => $member->id,
                'status' => 'reserved',
            ]);
        });
    }
}

