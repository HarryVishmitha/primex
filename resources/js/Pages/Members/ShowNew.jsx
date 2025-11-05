import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import Badge from '@/Components/Badge';
import DataTable from '@/Components/DataTable';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

const TABS = [
    { id: 'overview', label: 'Overview', icon: 'heroicons:squares-2x2' },
    { id: 'subscriptions', label: 'Subscriptions', icon: 'heroicons:credit-card' },
    { id: 'attendance', label: 'Attendance', icon: 'heroicons:calendar-days' },
    { id: 'billing', label: 'Billing', icon: 'heroicons:banknotes' },
    { id: 'notes', label: 'Notes', icon: 'heroicons:document-text' },
];

const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    }).format((cents || 0) / 100);
};

const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
        return '—';
    }
};

const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
        return '—';
    }
};

export default function MemberShow({ memberId }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const http = useMemo(() => window.axios, []);

    const fetchMember = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await http.get(`/web/api/admin/members/${memberId}`, {
                params: { raw: 1 },
            });
            setMember(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Unable to load member details.');
        } finally {
            setLoading(false);
        }
    }, [memberId, http]);

    useEffect(() => {
        fetchMember();
    }, [fetchMember]);

    const subscriptionColumns = useMemo(
        () => [
            {
                accessorKey: 'plan.name',
                header: 'Plan',
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                        {row.original.plan?.name || '—'}
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const statusVariant = {
                        active: 'success',
                        expired: 'danger',
                        cancelled: 'warning',
                        pending: 'info',
                    }[row.original.status] || 'default';

                    return (
                        <Badge variant={statusVariant}>{row.original.status}</Badge>
                    );
                },
            },
            {
                accessorKey: 'starts_at',
                header: 'Start Date',
                cell: ({ row }) => formatDate(row.original.starts_at),
            },
            {
                accessorKey: 'ends_at',
                header: 'End Date',
                cell: ({ row }) => formatDate(row.original.ends_at),
            },
            {
                accessorKey: 'auto_renew',
                header: 'Auto Renew',
                cell: ({ row }) => (
                    <span>
                        {row.original.auto_renew ? (
                            <Icon icon="heroicons:check-circle" width="20" className="text-emerald-600" />
                        ) : (
                            <Icon icon="heroicons:x-circle" width="20" className="text-gray-400" />
                        )}
                    </span>
                ),
            },
        ],
        []
    );

    const attendanceColumns = useMemo(
        () => [
            {
                accessorKey: 'checked_in_at',
                header: 'Check-in',
                cell: ({ row }) => formatDateTime(row.original.checked_in_at),
            },
            {
                accessorKey: 'checked_out_at',
                header: 'Check-out',
                cell: ({ row }) => formatDateTime(row.original.checked_out_at),
            },
            {
                accessorKey: 'source',
                header: 'Source',
                cell: ({ row }) => {
                    const sourceIcons = {
                        qr: 'heroicons:qr-code',
                        manual: 'heroicons:hand-raised',
                        device: 'heroicons:device-phone-mobile',
                    };
                    return (
                        <div className="flex items-center gap-2">
                            <Icon icon={sourceIcons[row.original.source]} width="16" />
                            <span className="capitalize">{row.original.source}</span>
                        </div>
                    );
                },
            },
        ],
        []
    );

    const invoiceColumns = useMemo(
        () => [
            {
                accessorKey: 'number',
                header: 'Invoice #',
                cell: ({ row }) => (
                    <div className="font-mono font-medium text-gray-900 dark:text-gray-100">
                        {row.original.number}
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const statusVariant = {
                        paid: 'success',
                        issued: 'info',
                        void: 'danger',
                        draft: 'default',
                    }[row.original.status] || 'default';

                    return (
                        <Badge variant={statusVariant}>{row.original.status}</Badge>
                    );
                },
            },
            {
                accessorKey: 'issued_at',
                header: 'Issued',
                cell: ({ row }) => formatDate(row.original.issued_at),
            },
            {
                accessorKey: 'due_at',
                header: 'Due',
                cell: ({ row }) => formatDate(row.original.due_at),
            },
            {
                accessorKey: 'total_cents',
                header: 'Total',
                cell: ({ row }) => (
                    <div className="text-right font-medium">
                        {formatCurrency(row.original.total_cents)}
                    </div>
                ),
            },
        ],
        []
    );

    const paymentColumns = useMemo(
        () => [
            {
                accessorKey: 'paid_at',
                header: 'Date',
                cell: ({ row }) => formatDateTime(row.original.paid_at),
            },
            {
                accessorKey: 'method',
                header: 'Method',
                cell: ({ row }) => <span className="capitalize">{row.original.method}</span>,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const statusVariant = {
                        succeeded: 'success',
                        pending: 'warning',
                        failed: 'danger',
                        refunded: 'info',
                    }[row.original.status] || 'default';

                    return (
                        <Badge variant={statusVariant}>{row.original.status}</Badge>
                    );
                },
            },
            {
                accessorKey: 'amount_cents',
                header: 'Amount',
                cell: ({ row }) => (
                    <div className="text-right font-medium">
                        {formatCurrency(row.original.amount_cents)}
                    </div>
                ),
            },
        ],
        []
    );

    if (loading) {
        return (
            <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Loading...</h2>}>
                <Head title="Loading..." />
                <div className="flex h-96 items-center justify-center">
                    <Icon icon="svg-spinners:ring-resize" width="48" className="text-indigo-600" />
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error || !member) {
        return (
            <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Error</h2>}>
                <Head title="Error" />
                <div className="p-8">
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                        {error || 'Member not found'}
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit(route('members.index'))}
                            className="text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                            <Icon icon="heroicons:arrow-left" width="24" />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {member.full_name}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Member ID: {member.code}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <SecondaryButton onClick={fetchMember}>
                            <Icon icon="heroicons:arrow-path" width="16" className="mr-2" />
                            Refresh
                        </SecondaryButton>
                        <PrimaryButton onClick={() => router.visit(route('members.index'))}>
                            <Icon icon="heroicons:pencil" width="16" className="mr-2" />
                            Edit Member
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title={member.full_name} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Member Header Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-col gap-6 md:flex-row">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {member.avatar_url ? (
                                <img
                                    src={member.avatar_url}
                                    alt={member.full_name}
                                    className="h-32 w-32 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                                    <Icon icon="heroicons:user" width="64" />
                                </div>
                            )}
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Status
                                    </p>
                                    <Badge variant={member.status} className="mt-1">
                                        {member.status_label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Branch
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {member.branch?.name || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Balance Due
                                    </p>
                                    <p
                                        className={`mt-1 text-sm font-semibold ${
                                            member.balance_due_cents > 0
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-gray-900 dark:text-gray-100'
                                        }`}
                                    >
                                        {formatCurrency(member.balance_due_cents)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Member Since
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {formatDate(member.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Contact
                                    </p>
                                    <div className="mt-1 space-y-1">
                                        {member.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                                <Icon icon="heroicons:envelope" width="16" />
                                                {member.email}
                                            </div>
                                        )}
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                                <Icon icon="heroicons:phone" width="16" />
                                                {member.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Emergency Contact
                                    </p>
                                    {member.emergency_contact?.name ? (
                                        <div className="mt-1 space-y-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {member.emergency_contact.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {member.emergency_contact.phone} •{' '}
                                                {member.emergency_contact.relationship}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Not provided
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-200 dark:border-gray-800">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
                                        activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon icon={tab.icon} width="18" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Last Payment
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                            {formatDate(member.last_payment_at)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Next Expiry
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                            {formatDate(member.next_expiry_at)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Monthly Attendance
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                            {member.attendance_count || 0} visits
                                        </p>
                                    </div>
                                </div>

                                {member.latest_subscription && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                            Current Subscription
                                        </h3>
                                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Plan
                                                </p>
                                                <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                                                    {member.latest_subscription.plan?.name || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Status
                                                </p>
                                                <Badge variant={member.latest_subscription.status} className="mt-1">
                                                    {member.latest_subscription.status}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Valid From
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {formatDate(member.latest_subscription.starts_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Valid Until
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {formatDate(member.latest_subscription.ends_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'subscriptions' && (
                            <DataTable
                                data={member.subscriptions || []}
                                columns={subscriptionColumns}
                                pageSize={10}
                                showSearch={false}
                                emptyMessage="No subscriptions found."
                            />
                        )}

                        {activeTab === 'attendance' && (
                            <DataTable
                                data={member.attendance_logs || []}
                                columns={attendanceColumns}
                                pageSize={10}
                                showSearch={false}
                                emptyMessage="No attendance logs found."
                            />
                        )}

                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
                                        Invoices
                                    </h3>
                                    <DataTable
                                        data={member.invoices || []}
                                        columns={invoiceColumns}
                                        pageSize={5}
                                        showSearch={false}
                                        emptyMessage="No invoices found."
                                    />
                                </div>
                                <div>
                                    <h3 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
                                        Payments
                                    </h3>
                                    <DataTable
                                        data={member.payments || []}
                                        columns={paymentColumns}
                                        pageSize={5}
                                        showSearch={false}
                                        emptyMessage="No payments found."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="text-center py-12">
                                <Icon
                                    icon="heroicons:document-text"
                                    width="48"
                                    className="mx-auto text-gray-300 dark:text-gray-700"
                                />
                                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                    Notes feature coming soon.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
