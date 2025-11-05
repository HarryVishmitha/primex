<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Owner', 'Manager']);
    }

    public function view(User $user, Activity $activity): bool
    {
        return $this->sameTenant($user, $activity) && $user->hasAnyRole(['Owner', 'Manager']);
    }

    private function sameTenant(User $user, Activity $activity): bool
    {
        return $user->tenant_id === $activity->tenant_id;
    }
}
