<?php

namespace App\Providers;

use App\Models\AttendanceLog;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Subscription;
use App\Policies\AttendanceLogPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\MemberPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\SubscriptionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Member::class => MemberPolicy::class,
        Subscription::class => SubscriptionPolicy::class,
        AttendanceLog::class => AttendanceLogPolicy::class,
        Payment::class => PaymentPolicy::class,
        Invoice::class => InvoicePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
