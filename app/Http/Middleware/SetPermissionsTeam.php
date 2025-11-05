<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class SetPermissionsTeam
{
    public function __construct(
        private readonly PermissionRegistrar $registrar,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $teamId = null;

        if (app()->bound('tenancy') && tenancy()->initialized) {
            $teamId = tenant()->getTenantKey();
        } elseif ($request->user()) {
            $teamId = $request->user()->tenant_id;
        }

        $currentTeamId = $this->registrar->getPermissionsTeamId();

        if ($currentTeamId !== $teamId) {
            $this->registrar->setPermissionsTeamId($teamId);
            $this->registrar->forgetCachedPermissions();
        }

        return $next($request);
    }
}
