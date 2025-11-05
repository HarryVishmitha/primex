<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class CommunicationSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId;

        Announcement::factory()->count(3)->state(fn () => [
            'tenant_id' => $tenantId,
        ])->create();

        Setting::factory()->count(3)->state(fn () => [
            'tenant_id' => $tenantId,
        ])->create();
    }
}
