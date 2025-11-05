<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUlid('invoice_id')->nullable()->constrained('invoices')->restrictOnDelete();
            $table->foreignUlid('subscription_id')->nullable()->constrained('subscriptions')->restrictOnDelete();
            $table->foreignUlid('member_id')->constrained('members')->restrictOnDelete();
            $table->enum('method', ['cash', 'card', 'online', 'bank_transfer', 'cheque']);
            $table->unsignedBigInteger('amount_cents');
            $table->enum('status', ['pending', 'succeeded', 'failed', 'refunded'])->default('pending')->index();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'member_id', 'paid_at'], 'payments_tenant_member_paid_at_idx');
            $table->index(['tenant_id', 'status'], 'payments_tenant_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
