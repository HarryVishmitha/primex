import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const statusBadge = {
    prospect:
        'inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    active:
        'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    inactive:
        'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    suspended:
        'inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const formatDate = (value, fallback = '—') => {
    if (!value) return fallback;
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(new Date(value));
};

const formatDateTime = (value, fallback = '—') => {
    if (!value) return fallback;
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const formatMoney = (amountCents) => {
    const cents = Number(amountCents ?? 0);
    return `LKR ${(cents / 100).toFixed(2)}`;
};

export default function MembersShow() {
    const { memberId } = usePage().props;

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const http = useMemo(() => window.axios, []);

    const fetchMember = async () => {
        if (!memberId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await http.get(`/api/admin/members/${memberId}`, {
                params: { with_deleted: true },
            });
            setMember(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    'Unable to load member details. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMember();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId]);

    const changeStatus = async (status) => {
        if (!member) return;
        setError(null);
        setSuccess(null);

        try {
            await http.post(`/api/admin/members/${member.id}/status`, { status });
            setSuccess(`Status updated to ${status}.`);
            fetchMember();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Unable to update status.');
        }
    };

    const archive = async () => {
        if (!member) return;
        setError(null);
        setSuccess(null);

        try {
            await http.delete(`/api/admin/members/${member.id}`);
            setSuccess('Member archived.');
            fetchMember();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Unable to archive member.');
        }
    };

    const restore = async () => {
        if (!member) return;
        setError(null);
        setSuccess(null);

        try {
            await http.post(`/api/admin/members/${member.id}/restore`);
            setSuccess('Member restored.');
            fetchMember();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Unable to restore member.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Member Overview
                    </h2>
                    <Link
                        href={route('members.index')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        Back to list
                    </Link>
                    {member && (
                        <Link
                            href={route('members.edit', member.id)}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-500 dark:text-gray-300"
                        >
                            Edit member
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Member Details" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    {(error || success) && (
                        <div
                            className={`rounded-lg border px-4 py-3 text-sm ${
                                error
                                    ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-200'
                                    : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-200'
                            }`}
                        >
                            {error ?? success}
                        </div>
                    )}

                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {loading && !member ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading member...</p>
                        ) : member ? (
                            <div className="flex flex-col gap-6 md:flex-row">
                                <div className="flex flex-col items-center gap-3 md:items-start">
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                                        {member.avatar_url ? (
                                            <img
                                                src={member.avatar_url}
                                                alt={member.full_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-semibold text-gray-400">
                                                {member.full_name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            {member.full_name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {member.code}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={statusBadge[member.status]}>
                                            {member.status}
                                        </span>
                                        {member.deleted_at && (
                                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                                                Archived
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => router.visit(route('members.edit', member.id))}
                                            className="rounded-md border border-indigo-300 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                                        >
                                            Edit profile
                                        </button>
                                        {member.deleted_at ? (
                                            <button
                                                type="button"
                                                onClick={restore}
                                                className="rounded-md border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                                            >
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={archive}
                                                className="rounded-md border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-900/30"
                                            >
                                                Archive
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Contact
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                {member.email || '—'}
                                            </p>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {member.phone || '—'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Branch
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                {member.branch?.name ?? '—'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Next Renewal
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatDate(member.next_expiry_at)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Balance Due
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatMoney(member.balance_due_cents)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Status quick action
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Update member lifecycle in one click.
                                                </p>
                                            </div>
                                            <select
                                                value={member.status}
                                                onChange={(e) => changeStatus(e.target.value)}
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                            >
                                                <option value="prospect">Prospect</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Member not found or you do not have access.
                            </p>
                        )}
                    </section>

                    {member && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        Recent Subscriptions
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Showing latest {member.subscriptions?.length ?? 0}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {(member.subscriptions ?? []).length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No subscriptions yet.
                                        </p>
                                    )}
                                    {(member.subscriptions ?? []).map((subscription) => (
                                        <div
                                            key={subscription.id}
                                            className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {subscription.plan?.name ?? 'Plan'}
                                                </span>
                                                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                                    {subscription.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(subscription.starts_at)} —{' '}
                                                {formatDate(subscription.ends_at)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Auto renew: {subscription.auto_renew ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        Recent Invoices
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Showing latest {member.invoices?.length ?? 0}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {(member.invoices ?? []).length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No invoices generated yet.
                                        </p>
                                    )}
                                    {(member.invoices ?? []).map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    #{invoice.number}
                                                </span>
                                                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                                    {invoice.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {formatMoney(invoice.total_cents)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Issued: {formatDate(invoice.issued_at)}
                                                {invoice.due_at && ` • Due: ${formatDate(invoice.due_at)}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        Latest Payments
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Showing latest {member.payments?.length ?? 0}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                                        <thead>
                                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                <th className="px-3 py-2">Amount</th>
                                                <th className="px-3 py-2">Status</th>
                                                <th className="px-3 py-2">Method</th>
                                                <th className="px-3 py-2">Paid at</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                            {(member.payments ?? []).length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                                                    >
                                                        No payments on record.
                                                    </td>
                                                </tr>
                                            )}
                                            {(member.payments ?? []).map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                        {payment.amount_formatted ?? formatMoney(payment.amount_cents)}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {payment.status}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {payment.method}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDateTime(payment.paid_at)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        Recent Attendance
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Showing latest {member.attendance_logs?.length ?? 0}
                                    </span>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {(member.attendance_logs ?? []).length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No attendance logged yet.
                                        </p>
                                    )}
                                    {(member.attendance_logs ?? []).map((log) => (
                                        <div
                                            key={log.id}
                                            className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                                        >
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatDateTime(log.checked_in_at)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Check-out: {formatDateTime(log.checked_out_at, '—')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Source: {log.source ?? 'unknown'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

