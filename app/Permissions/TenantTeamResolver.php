<?php

declare(strict_types=1);

namespace App\Permissions;

use Spatie\Permission\Contracts\PermissionsTeamResolver;

class TenantTeamResolver implements PermissionsTeamResolver
{
    protected string|int|null $teamId = null;

    public function getPermissionsTeamId(): string|int|null
    {
        if ($this->teamId !== null) {
            return $this->teamId;
        }

        if (app()->bound('tenancy') && tenancy()->initialized) {
            return tenant()->getTenantKey();
        }

        return null;
    }

    /**
     * @param string|int|null $id
     */
    public function setPermissionsTeamId($id): void
    {
        $this->teamId = $id;
    }
}
