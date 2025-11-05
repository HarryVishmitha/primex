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
        if (app()->bound('tenancy') && tenancy()->initialized) {
            $this->registrar->setPermissionsTeamId(tenant()->getTenantKey());
        } else {
            $this->registrar->setPermissionsTeamId(null);
        }

        return $next($request);
    }
}

