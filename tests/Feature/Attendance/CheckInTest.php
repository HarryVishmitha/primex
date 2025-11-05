<?php

use App\Domain\Attendance\CheckInMember;
use App\Models\AttendanceLog;
use App\Models\Branch;
use App\Models\Member;
use App\Models\Tenant;
use DomainException;

it('prevents double check-in when an open session exists', function () {
    $tenant = Tenant::factory()->create();
    $branch = Branch::factory()->create(['tenant_id' => $tenant->id]);

    $member = Member::factory()->create([
        'tenant_id' => $tenant->id,
        'branch_id' => $branch->id,
        'user_id' => null,
        'status' => 'active',
    ]);

    $checkIn = app(CheckInMember::class);

    $log = $checkIn($member, $branch->id, 'test');

    expect($log)
        ->toBeInstanceOf(AttendanceLog::class)
        ->and($log->checked_out_at)->toBeNull();

    expect(fn () => $checkIn($member, $branch->id, 'test'))->toThrow(DomainException::class);
});

