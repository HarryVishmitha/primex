<?php

namespace App\Policies;

use App\Models\Member;
use App\Models\User;

class MemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('members.view');
    }

    public function view(User $user, Member $member): bool
    {
        return $this->sameTenant($user, $member) && $user->can('members.view');
    }

    public function create(User $user): bool
    {
        return $user->can('members.manage');
    }

    public function update(User $user, Member $member): bool
    {
        return $this->sameTenant($user, $member)
            && $this->sameBranchOrElevated($user, $member)
            && $user->can('members.manage');
    }

    public function delete(User $user, Member $member): bool
    {
        return $this->update($user, $member);
    }

    private function sameTenant(User $user, Member $member): bool
    {
        return $user->tenant_id === $member->tenant_id;
    }

    private function sameBranchOrElevated(User $user, Member $member): bool
    {
        return $user->hasAnyRole(['Owner', 'Manager']) || $user->branch_id === $member->branch_id;
    }
}
