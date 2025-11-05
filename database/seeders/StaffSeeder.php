<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    /** @var array<string, string> */
    public static array $staffIds = [];

    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId;
        if (! $tenantId) {
            $tenantId = Tenant::query()->value('id');

            if (! $tenantId) {
                throw new \RuntimeException('Tenant not seeded. Run TenantSeeder before StaffSeeder.');
            }

            TenantSeeder::$tenantId = $tenantId;
        }
        $branches = BranchSeeder::$branchIds;

        /** @var PermissionRegistrar $registrar */
        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($tenantId);

        $owner = User::factory()->create([
            'tenant_id' => $tenantId,
            'branch_id' => $branches[0] ?? null,
            'name' => 'Primex Owner',
            'email' => 'owner@primex.test',
            'password' => Hash::make('password'),
        ]);
        $owner->assignRole('Owner');
        self::$staffIds['owner'] = $owner->id;

        $manager = User::factory()->create([
            'tenant_id' => $tenantId,
            'branch_id' => $branches[0] ?? null,
            'name' => 'Primex Manager',
            'email' => 'manager@primex.test',
            'password' => Hash::make('password'),
        ]);
        $manager->assignRole('Manager');
        self::$staffIds['manager'] = $manager->id;

        $trainer = User::factory()->create([
            'tenant_id' => $tenantId,
            'branch_id' => $branches[1] ?? $branches[0] ?? null,
            'name' => 'Primex Trainer',
            'email' => 'trainer@primex.test',
            'password' => Hash::make('password'),
        ]);
        $trainer->assignRole('Trainer');
        self::$staffIds['trainer'] = $trainer->id;

        $receptionist = User::factory()->create([
            'tenant_id' => $tenantId,
            'branch_id' => $branches[1] ?? $branches[0] ?? null,
            'name' => 'Primex Reception',
            'email' => 'frontdesk@primex.test',
            'password' => Hash::make('password'),
        ]);
        $receptionist->assignRole('Receptionist');
        self::$staffIds['receptionist'] = $receptionist->id;
    }

    public static function createTrainerFallback(string $tenantId, ?string $branchId): User
    {
        /** @var PermissionRegistrar $registrar */
        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($tenantId);

        $trainer = User::factory()->create([
            'tenant_id' => $tenantId,
            'branch_id' => $branchId,
            'name' => 'Fallback Trainer',
            'email' => 'trainer+'.uniqid().'@primex.test',
        ]);

        $trainer->assignRole('Trainer');
        self::$staffIds['trainer'] = $trainer->id;

        return $trainer;
    }
}
