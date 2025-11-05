import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Icon } from '@iconify/react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard({ stats, charts, recentActivities, upcomingClasses, topMembers, pendingInvoices }) {
    // Chart options
    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: (context) => `Revenue: LKR${context.parsed.y.toFixed(2)}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    callback: (value) => `LKR${value}`,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const memberGrowthChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: (context) => `New Members: ${context.parsed.y}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    stepSize: 1,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const revenueChartData = {
        labels: charts.revenue.labels,
        datasets: [
            {
                label: 'Revenue',
                data: charts.revenue.data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const memberGrowthChartData = {
        labels: charts.memberGrowth.labels,
        datasets: [
            {
                label: 'New Members',
                data: charts.memberGrowth.data,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
            },
        ],
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    const formatGrowth = (growth) => {
        const isPositive = growth >= 0;
        return (
            <span className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <Icon icon={isPositive ? 'mdi:arrow-up' : 'mdi:arrow-down'} className="w-4 h-4 mr-1" />
                {Math.abs(growth)}%
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 overflow-hidden shadow-lg rounded-lg mb-6">
                        <div className="p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">Welcome to PrimeX Fitness</h2>
                            <p className="text-blue-100">Here's what's happening with your fitness center today.</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        {/* Members Card */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-shrink-0">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Icon icon="mdi:account-group" className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                    {formatGrowth(stats.totalMembers.growth)}
                                </div>
                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</dt>
                                    <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalMembers.value}</dd>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{stats.totalMembers.new} this month</p>
                                </div>
                            </div>
                        </div>

                        {/* Subscriptions Card */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-shrink-0">
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <Icon icon="mdi:badge-account" className="h-8 w-8 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                    {formatGrowth(stats.activeSubscriptions.growth)}
                                </div>
                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</dt>
                                    <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.activeSubscriptions.value}</dd>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{stats.activeSubscriptions.new} this month</p>
                                </div>
                            </div>
                        </div>

                        {/* Check-ins Card */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-shrink-0">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                            <Icon icon="mdi:login" className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </div>
                                    {formatGrowth(stats.todayCheckIns.growth)}
                                </div>
                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Check-ins</dt>
                                    <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.todayCheckIns.value}</dd>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs yesterday</p>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-shrink-0">
                                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                            <Icon icon="mdi:cash-multiple" className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                    </div>
                                    {formatGrowth(stats.monthlyRevenue.growth)}
                                </div>
                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</dt>
                                    <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCurrency(stats.monthlyRevenue.value)}</dd>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Revenue Chart */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue Trend (Last 7 Days)</h3>
                                <Icon icon="mdi:chart-line" className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="h-64">
                                <Line data={revenueChartData} options={revenueChartOptions} />
                            </div>
                        </div>

                        {/* Member Growth Chart */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Member Growth (Last 6 Months)</h3>
                                <Icon icon="mdi:chart-bar" className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="h-64">
                                <Bar data={memberGrowthChartData} options={memberGrowthChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row - 3 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activities */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Check-ins</h3>
                                    <Icon icon="mdi:clock-outline" className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {recentActivities.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {recentActivities.map((activity) => (
                                            <li key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                            <Icon icon="mdi:account" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {activity.member_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {activity.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <Icon icon="mdi:information-outline" className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                        <p>No recent activities</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Classes */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Classes</h3>
                                    <Icon icon="mdi:calendar" className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {upcomingClasses.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {upcomingClasses.map((classItem) => (
                                            <li key={classItem.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {classItem.title}
                                                        </p>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {classItem.booked}/{classItem.capacity}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                        <Icon icon="mdi:account-tie" className="h-4 w-4 mr-1" />
                                                        {classItem.trainer}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                        <Icon icon="mdi:clock-outline" className="h-4 w-4 mr-1" />
                                                        {classItem.start_time}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <Icon icon="mdi:calendar-blank" className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                        <p>No upcoming classes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Members or Pending Invoices */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {pendingInvoices.length > 0 ? 'Pending Invoices' : 'Top Members'}
                                    </h3>
                                    <Icon icon={pendingInvoices.length > 0 ? 'mdi:file-document-alert' : 'mdi:trophy'} className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {pendingInvoices.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {pendingInvoices.map((invoice) => (
                                            <li key={invoice.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {invoice.member_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Due: {invoice.due_date}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(invoice.amount / 100)}
                                                        </p>
                                                        {invoice.overdue && (
                                                            <span className="text-xs text-red-600 dark:text-red-400">Overdue</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : topMembers.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {topMembers.map((member, index) => (
                                            <li key={member.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                            index === 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                                                            index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                                                            index === 2 ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                                                            'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {member.visits} visits this month
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <Icon icon="mdi:information-outline" className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                        <p>No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
