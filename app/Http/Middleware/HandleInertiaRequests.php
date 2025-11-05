<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        if ($user) {
            // Ensure permissions team is set
            if ($user->tenant_id) {
                app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($user->tenant_id);
            }
            
            // Force load roles and permissions
            $user->load('roles', 'permissions');
            
            $roles = $user->getRoleNames()->toArray();
            $permissions = $user->getAllPermissions()->pluck('name')->values()->toArray();
        } else {
            $roles = [];
            $permissions = [];
        }
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $permissions,
                'roles' => $roles,
                'can' => collect($permissions)
                    ->mapWithKeys(fn (string $permission) => [$permission => true])
                    ->all(),
            ],
            'csrf_token' => csrf_token(),
        ];
    }
}
