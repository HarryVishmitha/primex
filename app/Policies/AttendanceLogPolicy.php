<?php

namespace App\Policies;

use App\Models\AttendanceLog;
use App\Models\User;

class AttendanceLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('attendance.manage');
    }

    public function view(User $user, AttendanceLog $log): bool
    {
        return $this->authorized($user, $log);
    }

    public function create(User $user): bool
    {
        return $user->can('attendance.manage');
    }

    public function update(User $user, AttendanceLog $log): bool
    {
        return $this->authorized($user, $log);
    }

    public function delete(User $user, AttendanceLog $log): bool
    {
        return false;
    }

    private function authorized(User $user, AttendanceLog $log): bool
    {
        return $user->tenant_id === $log->tenant_id
            && ($user->hasAnyRole(['Owner', 'Manager']) || $user->branch_id === $log->branch_id)
            && $user->can('attendance.manage');
    }
}
