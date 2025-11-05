<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductStock;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = TenantSeeder::$tenantId;
        $branches = BranchSeeder::$branchIds;

        $categories = ProductCategory::factory()
            ->count(3)
            ->state(fn () => ['tenant_id' => $tenantId])
            ->create();

        $products = collect();
        foreach ($categories as $category) {
            $products = $products->merge(
                Product::factory()
                    ->count(3)
                    ->state(fn () => [
                        'tenant_id' => $tenantId,
                        'category_id' => $category->id,
                    ])
                    ->create()
            );
        }

        $products->each(function (Product $product) use ($tenantId, $branches) {
            foreach ($branches as $branchId) {
                ProductStock::factory()->create([
                    'tenant_id' => $tenantId,
                    'product_id' => $product->id,
                    'branch_id' => $branchId,
                    'on_hand' => rand(10, 50),
                ]);
            }
        });
    }
}
