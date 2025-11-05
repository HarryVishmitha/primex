<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\TenantModel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TenantObserver
{
    public function creating(TenantModel $model): void
    {
        if (! $model->getAttribute('id')) {
            $model->setAttribute('id', (string) Str::ulid());
        }

        if (! $model->getAttribute('tenant_id') && app()->bound('tenancy') && tenancy()->initialized) {
            $model->setAttribute('tenant_id', tenant()->getTenantKey());
        }

        if ($model->isFillable('branch_id') && $model->getAttribute('branch_id') === null) {
            $branchId = app()->bound('branch.context')
                ? app('branch.context')
                : Auth::user()?->branch_id;

            if ($branchId !== null) {
                $model->setAttribute('branch_id', $branchId);
            }
        }
    }
}

