<?php

declare(strict_types=1);

namespace App\Domain\Attendance;

use App\Models\AttendanceLog;
use App\Models\Member;
use DomainException;
use Illuminate\Support\Facades\DB;

class CheckInMember
{
    public function __invoke(Member $member, string $branchId, string $source = 'qr'): AttendanceLog
    {
        return DB::transaction(function () use ($member, $branchId, $source) {
            $hasOpenSession = AttendanceLog::query()
                ->where('tenant_id', $member->tenant_id)
                ->where('member_id', $member->id)
                ->whereNull('checked_out_at')
                ->lockForUpdate()
                ->exists();

            if ($hasOpenSession) {
                throw new DomainException('Member has an open attendance session.');
            }

            return AttendanceLog::create([
                'tenant_id' => $member->tenant_id,
                'member_id' => $member->id,
                'branch_id' => $branchId,
                'checked_in_at' => now(),
                'source' => $source,
            ]);
        });
    }
}

