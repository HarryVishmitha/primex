<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('invoices.manage');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->sameTenant($user, $invoice) && $user->can('invoices.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('invoices.manage');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $this->sameTenant($user, $invoice) && $user->can('invoices.manage');
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return false;
    }

    private function sameTenant(User $user, Invoice $invoice): bool
    {
        return $user->tenant_id === $invoice->tenant_id;
    }
}
