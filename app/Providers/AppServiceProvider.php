<?php

namespace App\Providers;

use App\Models\{Announcement,
    AttendanceLog,
    BodyMeasurement,
    Branch,
    ClassBooking,
    ClassCategory,
    ClassSchedule,
    ClassWaitlist,
    Device,
    Exercise,
    FitnessClass,
    Invoice,
    InvoiceItem,
    Meal,
    MealPlanTemplate,
    MealTemplateDay,
    Member,
    MemberMealPlan,
    MemberProgram,
    Notification,
    Payment,
    Plan,
    PosSale,
    PosSaleItem,
    Product,
    ProductCategory,
    ProductStock,
    Program,
    Refund,
    Setting,
    StockMovement,
    Subscription,
    Ticket,
    TicketMessage,
    WorkoutSession,
    WorkoutSet};
use App\Observers\FinanceGuardObserver;
use App\Observers\InvoiceItemObserver;
use App\Observers\PosSaleItemObserver;
use App\Observers\TenantObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $tenantScopedModels = [
            Announcement::class,
            AttendanceLog::class,
            BodyMeasurement::class,
            Branch::class,
            ClassBooking::class,
            ClassCategory::class,
            ClassSchedule::class,
            ClassWaitlist::class,
            Device::class,
            Exercise::class,
            FitnessClass::class,
            Invoice::class,
            InvoiceItem::class,
            Meal::class,
            MealPlanTemplate::class,
            MealTemplateDay::class,
            Member::class,
            MemberMealPlan::class,
            MemberProgram::class,
            Notification::class,
            Payment::class,
            Plan::class,
            PosSale::class,
            PosSaleItem::class,
            Product::class,
            ProductCategory::class,
            ProductStock::class,
            Program::class,
            Refund::class,
            Setting::class,
            StockMovement::class,
            Subscription::class,
            Ticket::class,
            TicketMessage::class,
            WorkoutSession::class,
            WorkoutSet::class,
        ];

        foreach ($tenantScopedModels as $model) {
            $model::observe(TenantObserver::class);
        }

        InvoiceItem::observe(InvoiceItemObserver::class);
        PosSaleItem::observe(PosSaleItemObserver::class);

        foreach ([Invoice::class, Payment::class, Refund::class] as $financeModel) {
            $financeModel::observe(FinanceGuardObserver::class);
        }
    }
}
