<?php

declare(strict_types=1);

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

final class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (! app()->bound('tenancy') || ! tenancy()->initialized) {
            return;
        }

        $builder->where($model->qualifyColumn('tenant_id'), tenant()->getTenantKey());
    }

    public function extend(Builder $builder): void
    {
        $scope = $this;

        $builder->macro('forTenant', function (Builder $builder, string $tenantId) use ($scope) {
            return $builder->withoutGlobalScope($scope)
                ->where($builder->getModel()->qualifyColumn('tenant_id'), $tenantId);
        });
    }
}
