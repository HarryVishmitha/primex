<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        /** @var PermissionRegistrar $registrar */
        $registrar = app(PermissionRegistrar::class);
        $registrar->forgetCachedPermissions();

        $permissions = [
            'members.view',
            'members.manage',
            'subscriptions.manage',
            'attendance.manage',
            'invoices.manage',
            'payments.manage',
            'classes.manage',
            'pos.sell',
            'reports.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $tenantId = TenantSeeder::$tenantId;

        $roleDefinitions = [
            'Owner' => $permissions,
            'Manager' => ['members.view', 'members.manage', 'subscriptions.manage', 'classes.manage', 'invoices.manage', 'payments.manage', 'reports.view'],
            'Trainer' => ['members.view', 'attendance.manage', 'classes.manage'],
            'Receptionist' => ['members.view', 'members.manage', 'payments.manage', 'pos.sell'],
            'Member' => ['members.view'],
        ];

        foreach ($roleDefinitions as $role => $rolePermissions) {
            $roleModel = Role::firstOrCreate([
                'name' => $role,
                'guard_name' => 'web',
                'tenant_id' => $tenantId,
            ]);

            $roleModel->syncPermissions($rolePermissions);
        }
    }
}
