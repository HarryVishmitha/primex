<?php

declare(strict_types=1);

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

final class BranchScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $branchId = $this->resolveBranchId();

        if ($branchId === null) {
            return;
        }

        $builder->where($model->qualifyColumn('branch_id'), $branchId);
    }

    public function extend(Builder $builder): void
    {
        $scope = $this;

        $builder->macro('forBranch', function (Builder $builder, ?string $branchId) use ($scope) {
            if ($branchId === null) {
                return $builder->withoutGlobalScope($scope)
                    ->whereNull($builder->getModel()->qualifyColumn('branch_id'));
            }

            return $builder->withoutGlobalScope($scope)
                ->where($builder->getModel()->qualifyColumn('branch_id'), $branchId);
        });
    }

    private function resolveBranchId(): ?string
    {
        if (app()->bound('branch.context')) {
            return app('branch.context');
        }

        return Auth::user()?->branch_id;
    }
}
