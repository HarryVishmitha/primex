<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            TenantSeeder::class,
            BranchSeeder::class,
            RolesAndPermissionsSeeder::class,
            StaffSeeder::class,
            MemberSeeder::class,
            PlanSeeder::class,
            SubscriptionSeeder::class,
            InventorySeeder::class,
            ClassSeeder::class,
            FinanceSeeder::class,
            CommunicationSeeder::class,
        ]);
    }
}
