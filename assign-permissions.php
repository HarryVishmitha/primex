<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::first();
echo "User: {$user->email}\n";
echo "User tenant_id: {$user->tenant_id}\n\n";

// Set the permissions team ID to the user's tenant
$registrar = app(Spatie\Permission\PermissionRegistrar::class);
$registrar->setPermissionsTeamId($user->tenant_id);
$registrar->forgetCachedPermissions();

// Update or create the Owner role for this tenant
$role = Spatie\Permission\Models\Role::where('name', 'Owner')
    ->whereNull('tenant_id')
    ->first();

if ($role) {
    echo "Updating existing Owner role with tenant_id...\n";
    $role->tenant_id = $user->tenant_id;
    $role->save();
} else {
    $role = Spatie\Permission\Models\Role::where('name', 'Owner')
        ->where('tenant_id', $user->tenant_id)
        ->first();
    
    if (!$role) {
        echo "Creating Owner role for this tenant...\n";
        $role = Spatie\Permission\Models\Role::create([
            'name' => 'Owner',
            'tenant_id' => $user->tenant_id,
            'guard_name' => 'web'
        ]);
    }
}

// Update or create permissions for this tenant
$permNames = ['members.view', 'members.manage', 'subscriptions.manage', 'attendance.manage', 
              'invoices.manage', 'payments.manage', 'classes.manage', 'pos.sell', 'reports.view'];

foreach ($permNames as $permName) {
    $perm = Spatie\Permission\Models\Permission::where('name', $permName)
        ->whereNull('tenant_id')
        ->first();
    
    if ($perm) {
        echo "Updating permission: {$permName}\n";
        $perm->tenant_id = $user->tenant_id;
        $perm->save();
    } else {
        $existing = Spatie\Permission\Models\Permission::where('name', $permName)
            ->where('tenant_id', $user->tenant_id)
            ->first();
        
        if (!$existing) {
            echo "Creating permission: {$permName}\n";
            Spatie\Permission\Models\Permission::create([
                'name' => $permName,
                'tenant_id' => $user->tenant_id,
                'guard_name' => 'web'
            ]);
        }
    }
}

// Sync permissions to role
$permissions = Spatie\Permission\Models\Permission::where('tenant_id', $user->tenant_id)->get();
$role->syncPermissions($permissions);

// Assign role to user
$user->syncRoles([$role]);

// Clear cache
$registrar->forgetCachedPermissions();

echo "\nDone! Owner role assigned with {$permissions->count()} permissions!\n";
echo "User roles: " . $user->fresh()->roles->pluck('name')->join(', ') . "\n";
echo "User permissions: " . $user->fresh()->getAllPermissions()->pluck('name')->join(', ') . "\n";
