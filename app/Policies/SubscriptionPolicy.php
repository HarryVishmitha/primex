<?php

namespace App\Policies;

use App\Models\Subscription;
use App\Models\User;

class SubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('subscriptions.manage');
    }

    public function view(User $user, Subscription $subscription): bool
    {
        return $this->sameTenant($user, $subscription) && $user->can('subscriptions.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('subscriptions.manage');
    }

    public function update(User $user, Subscription $subscription): bool
    {
        return $this->sameTenant($user, $subscription) && $user->can('subscriptions.manage');
    }

    public function delete(User $user, Subscription $subscription): bool
    {
        return false;
    }

    private function sameTenant(User $user, Subscription $subscription): bool
    {
        return $user->tenant_id === $subscription->tenant_id;
    }
}
