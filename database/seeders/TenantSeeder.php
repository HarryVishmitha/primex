<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public static string $tenantId;

    public function run(): void
    {
        $tenant = Tenant::query()->first();

        if (! $tenant) {
            $tenant = Tenant::factory()->create([
                'id' => (string) Str::ulid(),
                'code' => 'PRIMEX',
                'name' => 'Primex Fitness',
                'status' => 'active',
            ]);
        } else {
            $tenant->update([
                'code' => 'PRIMEX',
                'status' => 'active',
            ]);
        }

        self::$tenantId = $tenant->id;
    }
}
