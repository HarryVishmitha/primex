import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STATUSES = ['prospect', 'active', 'inactive', 'suspended'];

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

const formatDateTime = (value) => {
    if (!value) return '—';
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

export default function MembersIndex() {
    const { auth } = usePage().props;
    const defaultBranch = auth?.user?.branch_id ?? '';

    const [members, setMembers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        q: '',
        status: [],
        plan_status: '',
        has_debt: '',
        branch_id: '',
        deleted: 'without',
        per_page: 10,
    });
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        branch_id: defaultBranch,
        status: 'prospect',
        code: '',
    });

    const http = useMemo(() => window.axios, []);

    const fetchMembers = useCallback(
        async (targetPage = 1) => {
            setLoading(true);
            setError(null);

            try {
                const response = await http.get('/api/admin/members', {
                    params: {
                        ...filters,
                        status: filters.status.length ? filters.status : undefined,
                        has_debt:
                            filters.has_debt === '' ? undefined : filters.has_debt === 'true',
                        page: targetPage,
                    },
                });

                setMembers(response.data.data ?? []);
                setMeta(response.data.meta ?? null);
                setPage(targetPage);
            } catch (err) {
                setError(
                    err.response?.data?.message ??
                        'Unable to load members. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        },
        [filters, http]
    );

    useEffect(() => {
        fetchMembers(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const toggleStatusFilter = (status) => {
        setFilters((prev) => {
            const next = prev.status.includes(status)
                ? prev.status.filter((s) => s !== status)
                : [...prev.status, status];

            return { ...prev, status: next };
        });
    };

    const submitCreate = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await http.post('/api/admin/members', {
                ...form,
                branch_id: form.branch_id || defaultBranch,
            });

            setForm({
                full_name: '',
                email: '',
                phone: '',
                gender: '',
                dob: '',
                branch_id: defaultBranch,
                status: 'prospect',
                code: '',
            });

            setSuccess('Member created successfully.');
            fetchMembers(1);
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    'Failed to create member. Verify the form and try again.'
            );
        }
    };

    const changeStatus = async (member, status) => {
        setError(null);
        setSuccess(null);

        try {
            await http.post(`/api/admin/members/${member.id}/status`, { status });
            setSuccess(`Status changed to ${status} for ${member.full_name}.`);
            fetchMembers(page);
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    `Unable to change status for ${member.full_name}.`
            );
        }
    };

    const archiveMember = async (member) => {
        setError(null);
        setSuccess(null);

        try {
            await http.delete(`/api/admin/members/${member.id}`);
            setSuccess(`Archived ${member.full_name}.`);
            fetchMembers(page);
        } catch (err) {
            setError(
                err.response?.data?.message ?? `Unable to archive ${member.full_name}.`
            );
        }
    };

    const restoreMember = async (member) => {
        setError(null);
        setSuccess(null);

        try {
            await http.post(`/api/admin/members/${member.id}/restore`);
            setSuccess(`Restored ${member.full_name}.`);
            fetchMembers(page);
        } catch (err) {
            setError(
                err.response?.data?.message ?? `Unable to restore ${member.full_name}.`
            );
        }
    };

    const uploadAvatar = async (member, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('photo', file);

        setError(null);
        setSuccess(null);

        try {
            await http.post(`/api/admin/members/${member.id}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(`Uploaded avatar for ${member.full_name}.`);
            fetchMembers(page);
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    `Unable to upload avatar for ${member.full_name}.`
            );
        }
    };

    const pagination = useMemo(() => {
        if (!meta) {
            return [];
        }

        const pages = [];
        for (let i = 1; i <= meta.last_page; i += 1) {
            pages.push(i);
        }
        return pages;
    }, [meta]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Member Management
                    </h2>
                    <div className="flex gap-3">
                        <Link
                            href={route('members.create')}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        >
                            Create Member
                        </Link>
                        <button
                            onClick={() => fetchMembers(page)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            type="button"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Members" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {(error || success) && (
                    <div
                        className={`rounded-md border px-4 py-3 text-sm ${
                            error
                                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-200'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-200'
                        }`}
                    >
                        {error ?? success}
                    </div>
                )}

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Filters
                    </h3>
                    <div className="mt-4 grid gap-4 lg:grid-cols-4">
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Search
                            </label>
                            <input
                                type="text"
                                value={filters.q}
                                onChange={(e) => updateFilter('q', e.target.value)}
                                placeholder="Search code, name, email or phone"
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Branch
                            </label>
                            <input
                                type="text"
                                value={filters.branch_id}
                                onChange={(e) => updateFilter('branch_id', e.target.value)}
                                placeholder="Branch ULID"
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Leave blank for all branches (requires permission).
                            </p>
                        </div>

                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Plan Status
                            </label>
                            <select
                                value={filters.plan_status}
                                onChange={(e) => updateFilter('plan_status', e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="">Any</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="none">No Plan</option>
                            </select>
                        </div>

                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Financial Status
                            </label>
                            <select
                                value={filters.has_debt}
                                onChange={(e) => updateFilter('has_debt', e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="">Any</option>
                                <option value="true">Has Outstanding Balance</option>
                                <option value="false">No Balance</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Member Status
                            </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {STATUSES.map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => toggleStatusFilter(status)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                            filters.status.includes(status)
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Deleted Members
                            </label>
                            <select
                                value={filters.deleted}
                                onChange={(e) => updateFilter('deleted', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="without">Hide archived</option>
                                <option value="with">Include archived</option>
                                <option value="only">Archived only</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Results per page
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="50"
                                value={filters.per_page}
                                onChange={(e) =>
                                    updateFilter('per_page', Number(e.target.value))
                                }
                                className="mt-1 w-24 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchMembers(1)}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        >
                            Apply Filters
                        </button>
                    </div>
                </section>

                <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Members
                        </h3>
                        {loading && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Loading...
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                            <thead>
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    <th className="px-3 py-2">Code</th>
                                    <th className="px-3 py-2">Name</th>
                                    <th className="px-3 py-2">Branch</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Contact</th>
                                    <th className="px-3 py-2">Last Payment</th>
                                    <th className="px-3 py-2">Next Expiry</th>
                                    <th className="px-3 py-2 text-right">Balance</th>
                                    <th className="px-3 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {members.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            No members found. Adjust filters or create a new
                                            member.
                                        </td>
                                    </tr>
                                )}
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                        <td className="px-3 py-3 font-medium text-gray-900 dark:text-gray-100">
                                            {member.code}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {member.full_name}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {member.email ?? '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {member.branch?.name ?? '—'}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={statusBadge[member.status]}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {member.phone ?? '—'}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDateTime(member.last_payment_at)}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDateTime(member.next_expiry_at)}
                                        </td>
                                        <td className="px-3 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                                            {formatMoney(member.balance_due_cents)}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('members.show', member.id)}
                                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route('members.edit', member.id)}
                                                    className="rounded-md border border-indigo-300 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                                                >
                                                    Edit
                                                </Link>
                                                <div>
                                                    <label className="sr-only" htmlFor={`avatar-${member.id}`}>
                                                        Upload avatar
                                                    </label>
                                                    <input
                                                        id={`avatar-${member.id}`}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(event) =>
                                                            uploadAvatar(member, event.target.files?.[0])
                                                        }
                                                        className="hidden"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            document
                                                                .getElementById(`avatar-${member.id}`)
                                                                .click()
                                                        }
                                                        className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                                    >
                                                        Avatar
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={member.status}
                                                        onChange={(e) => changeStatus(member, e.target.value)}
                                                        className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                                    >
                                                        {STATUSES.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {member.deleted_at ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => restoreMember(member)}
                                                        className="rounded-md border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                                                    >
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => archiveMember(member)}
                                                        className="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-900/30"
                                                    >
                                                        Archive
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.length > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                                Page {meta?.current_page} of {meta?.last_page}
                            </div>
                            <div className="flex gap-2">
                                {pagination.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => fetchMembers(p)}
                                        className={`rounded-md px-3 py-1 text-xs font-semibold ${
                                            p === page
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Quick Create
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        This lightweight form calls the new API endpoints. Specify additional
                        details in the dedicated create page when needed.
                    </p>

                    <form onSubmit={submitCreate} className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.full_name}
                                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Branch ULID
                            </label>
                            <input
                                type="text"
                                required
                                value={form.branch_id}
                                onChange={(e) => setForm((prev) => ({ ...prev, branch_id: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Defaults to your assigned branch if left blank.
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Manual Code (optional)
                            </label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                                placeholder="Auto-generated when blank"
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Gender
                            </label>
                            <select
                                value={form.gender}
                                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="">Prefer not to say</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non_binary">Non-binary</option>
                                <option value="undisclosed">Undisclosed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={form.dob}
                                onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                            >
                                Create Member
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
