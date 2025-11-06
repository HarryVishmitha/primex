<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Subscription;
use App\Models\AttendanceLog;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\ClassBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user) {
            activity('dashboard')
                ->causedBy($user)
                ->performedOn($user)
                ->event('viewed')
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->log('Viewed dashboard');
        }
        
        // Get date range for filtering
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $today = Carbon::today();

        // Total Members
        $totalMembers = Member::count();
        $newMembersThisMonth = Member::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $membersGrowth = $this->calculateGrowth(
            Member::whereBetween('created_at', [$startOfMonth->copy()->subMonth(), $startOfMonth])->count(),
            $newMembersThisMonth
        );

        // Active Subscriptions
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $newSubscriptionsThisMonth = Subscription::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $subscriptionsGrowth = $this->calculateGrowth(
            Subscription::whereBetween('created_at', [$startOfMonth->copy()->subMonth(), $startOfMonth])->count(),
            $newSubscriptionsThisMonth
        );

        // Today's Check-ins
        $todayCheckIns = AttendanceLog::whereDate('checked_in_at', $today)->count();
        $yesterdayCheckIns = AttendanceLog::whereDate('checked_in_at', $today->copy()->subDay())->count();
        $checkInsGrowth = $this->calculateGrowth($yesterdayCheckIns, $todayCheckIns);

        // Monthly Revenue (convert cents to dollars here so calculations use consistent units)
        $monthlyRevenue = Payment::where('status', 'succeeded')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount_cents') / 100;
        $lastMonthRevenue = Payment::where('status', 'succeeded')
            ->whereBetween('created_at', [$startOfMonth->copy()->subMonth(), $startOfMonth])
            ->sum('amount_cents') / 100;
        $revenueGrowth = $this->calculateGrowth($lastMonthRevenue, $monthlyRevenue);

        // Revenue chart data (last 7 days)
        $revenueChartData = $this->getRevenueChartData();

        // Member growth chart data (last 6 months)
        $memberGrowthData = $this->getMemberGrowthData();

        // Recent activities
        $recentActivities = $this->getRecentActivities();

        // Upcoming classes
        $upcomingClasses = $this->getUpcomingClasses();

        // Top members by attendance
        $topMembers = $this->getTopMembersByAttendance();

        // Pending invoices
        $pendingInvoices = Invoice::where('status', 'pending')
            ->with('member')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($invoice) => [
                'id' => $invoice->id,
                'member_name' => $invoice->member->full_name,
                'amount' => $invoice->total_amount,
                'due_date' => $invoice->due_date?->format('Y-m-d'),
                'overdue' => $invoice->due_date ? $invoice->due_date->isPast() : false,
            ]);

        
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalMembers' => [
                    'value' => $totalMembers,
                    'growth' => $membersGrowth,
                    'new' => $newMembersThisMonth,
                ],
                'activeSubscriptions' => [
                    'value' => $activeSubscriptions,
                    'growth' => $subscriptionsGrowth,
                    'new' => $newSubscriptionsThisMonth,
                ],
                'todayCheckIns' => [
                    'value' => $todayCheckIns,
                    'growth' => $checkInsGrowth,
                ],
                'monthlyRevenue' => [
                    'value' => $monthlyRevenue, // in dollars
                    'growth' => $revenueGrowth,
                ],
            ],
            'charts' => [
                'revenue' => $revenueChartData,
                'memberGrowth' => $memberGrowthData,
            ],
            'recentActivities' => $recentActivities,
            'upcomingClasses' => $upcomingClasses,
            'topMembers' => $topMembers,
            'pendingInvoices' => $pendingInvoices,
        ]);
    }

    private function calculateGrowth($previous, $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function getRevenueChartData(): array
    {
        $days = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            $amount = Payment::where('status', 'succeeded')
                ->whereDate('created_at', $date)
                ->sum('amount_cents');
            
            return [
                'date' => $date->format('M d'),
                'amount' => $amount / 100, // Convert cents to dollars
            ];
        });

        return [
            'labels' => $days->pluck('date')->toArray(),
            'data' => $days->pluck('amount')->toArray(),
        ];
    }

    private function getMemberGrowthData(): array
    {
        $months = collect(range(5, 0))->map(function ($monthsAgo) {
            $date = Carbon::now()->subMonths($monthsAgo);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();
            
            $count = Member::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
            
            return [
                'month' => $date->format('M Y'),
                'count' => $count,
            ];
        });

        return [
            'labels' => $months->pluck('month')->toArray(),
            'data' => $months->pluck('count')->toArray(),
        ];
    }

    private function getRecentActivities(): array
    {
        return AttendanceLog::with('member')
            ->latest('checked_in_at')
            ->take(10)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'member_name' => $log->member->full_name,
                'type' => 'check-in',
                'time' => $log->checked_in_at->diffForHumans(),
                'timestamp' => $log->checked_in_at->toIso8601String(),
            ])
            ->toArray();
    }

    private function getUpcomingClasses(): array
    {
        return \App\Models\ClassSchedule::with(['class', 'trainer'])
            ->where('starts_at', '>', Carbon::now())
            ->where('starts_at', '<', Carbon::now()->addDays(2))
            ->orderBy('starts_at')
            ->take(5)
            ->get()
            ->map(fn ($schedule) => [
                'id' => $schedule->id,
                'title' => $schedule->class->title,
                'trainer' => $schedule->trainer->name,
                'start_time' => $schedule->starts_at->format('M d, g:i A'),
                'capacity' => $schedule->capacity,
                'booked' => ClassBooking::where('schedule_id', $schedule->id)
                    ->where('status', 'confirmed')
                    ->count(),
            ])
            ->toArray();
    }

    private function getTopMembersByAttendance(): array
    {
        return Member::withCount([
                'attendanceLogs' => fn($query) => $query->whereBetween('checked_in_at', [
                    Carbon::now()->startOfMonth(),
                    Carbon::now()->endOfMonth()
                ])
            ])
            ->having('attendance_logs_count', '>', 0)
            ->orderByDesc('attendance_logs_count')
            ->take(5)
            ->get()
            ->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->full_name,
                'visits' => $member->attendance_logs_count,
            ])
            ->toArray();
    }
}
