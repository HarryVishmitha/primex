<?php

namespace Database\Seeders;

use App\Models\ClassCategory;
use App\Models\ClassSchedule;
use App\Models\FitnessClass;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId;
        $branches = BranchSeeder::$branchIds;
        $trainerId = StaffSeeder::$staffIds['trainer'] ?? null;

        if ($trainerId === null) {
            $trainer = StaffSeeder::createTrainerFallback($tenantId, $branches[0] ?? null);
            $trainerId = $trainer->id;
        }

        $categories = ClassCategory::factory()
            ->count(2)
            ->state(fn () => ['tenant_id' => $tenantId])
            ->create();

        foreach ($branches as $branchId) {
            foreach ($categories as $category) {
                $fitnessClass = FitnessClass::factory()->create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,
                    'category_id' => $category->id,
                ]);

                ClassSchedule::factory()->count(3)->create([
                    'tenant_id' => $tenantId,
                    'class_id' => $fitnessClass->id,
                    'trainer_id' => $trainerId,
                    'recurrence' => null,
                ]);
            }
        }
    }
}
