import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import MemberDrawer from '@/Components/MemberDrawer';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

const STATUSES = ['prospect', 'active', 'inactive', 'suspended'];

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

export default function MembersIndex({ auth, branches: initialBranches = [], users: initialUsers = [], plans: initialPlans = [] }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [drawerErrors, setDrawerErrors] = useState({});

    const [filters, setFilters] = useState({
        status: [],
        plan_status: '',
        has_debt: '',
        branch_id: '',
        deleted: 'without',
    });

    const http = useMemo(() => window.axios, []);

    // Server-side search term (debounced)
    const [search, setSearch] = useState('');
    useEffect(() => {
        const id = setTimeout(() => {
            updateFilter('q', search.trim() || undefined);
        }, 400);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Renew dialog state
    const [renewOpen, setRenewOpen] = useState(false);
    const [renewMember, setRenewMember] = useState(null);
    const [renewPlanId, setRenewPlanId] = useState('');
    const [renewAuto, setRenewAuto] = useState(false);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                ...filters,
                status: filters.status.length ? filters.status : undefined,
                has_debt: filters.has_debt === '' ? undefined : filters.has_debt === 'true',
                per_page: 100, // Fetch all for client-side pagination
                raw: 1, // TEMP: bypass JsonResource and use plain JSON mapping
            };

            const response = await http.get('/web/api/admin/members', { params });
            setMembers(response.data.data ?? []);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Unable to load members. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters, http]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const toggleStatusFilter = (status) => {
        setFilters((prev) => {
            const next = prev.status.includes(status)
                ? prev.status.filter((s) => s !== status)
                : [...prev.status, status];
            return { ...prev, status: next };
        });
    };

    const handleCreateMember = async (formData) => {
        setDrawerLoading(true);
        setDrawerErrors({});
        setError(null);
        setSuccess(null);

        try {
            // Clean up emergency contact if empty
            const payload = { ...formData };
            if (!payload.emergency_contact.name && !payload.emergency_contact.phone) {
                payload.emergency_contact = null;
            }

            await http.post('/web/api/admin/members', payload);
            setSuccess('Member created successfully.');
            setDrawerOpen(false);
            setEditingMember(null);
            fetchMembers();
        } catch (err) {
            if (err.response?.status === 422) {
                setDrawerErrors(err.response.data.errors || {});
            } else {
                setError(err.response?.data?.message ?? 'Failed to create member.');
            }
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleUpdateMember = async (formData) => {
        if (!editingMember) return;

        setDrawerLoading(true);
        setDrawerErrors({});
        setError(null);
        setSuccess(null);

        try {
            const payload = { ...formData };
            if (!payload.emergency_contact.name && !payload.emergency_contact.phone) {
                payload.emergency_contact = null;
            }

            await http.put(`/web/api/admin/members/${editingMember.id}`, payload);
            setSuccess('Member updated successfully.');
            setDrawerOpen(false);
            setEditingMember(null);
            fetchMembers();
        } catch (err) {
            if (err.response?.status === 422) {
                setDrawerErrors(err.response.data.errors || {});
            } else {
                setError(err.response?.data?.message ?? 'Failed to update member.');
            }
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleSubmitDrawer = (formData) => {
        if (editingMember) {
            handleUpdateMember(formData);
        } else {
            handleCreateMember(formData);
        }
    };

    const handleArchive = async (member) => {
        if (!confirm(`Are you sure you want to archive ${member.full_name}?`)) return;

        setError(null);
        setSuccess(null);

        try {
            await http.delete(`/web/api/admin/members/${member.id}`);
            setSuccess(`Successfully archived ${member.full_name}.`);
            fetchMembers();
        } catch (err) {
            setError(err.response?.data?.message ?? `Failed to archive ${member.full_name}.`);
        }
    };

    const handleRestore = async (member) => {
        setError(null);
        setSuccess(null);

        try {
            await http.post(`/web/api/admin/members/${member.id}/restore`);
            setSuccess(`Successfully restored ${member.full_name}.`);
            fetchMembers();
        } catch (err) {
            setError(err.response?.data?.message ?? `Failed to restore ${member.full_name}.`);
        }
    };

    const handleStatusChange = async (member, newStatus) => {
        setError(null);
        setSuccess(null);

        try {
            await http.post(`/web/api/admin/members/${member.id}/status`, { status: newStatus });
            setSuccess(`Status changed to ${newStatus} for ${member.full_name}.`);
            fetchMembers();
        } catch (err) {
            setError(err.response?.data?.message ?? `Failed to change status for ${member.full_name}.`);
        }
    };

    const openRenew = (member) => {
        const defaultPlan = member.latest_subscription?.plan?.id || initialPlans[0]?.id || '';
        setRenewMember(member);
        setRenewPlanId(defaultPlan);
        setRenewAuto(!!member.latest_subscription?.auto_renew);
        setRenewOpen(true);
    };

    const handleRenew = async (member) => {
        setError(null);
        setSuccess(null);
        try {
            const fallbackPlanId = (initialPlans && initialPlans.length > 0) ? initialPlans[0].id : undefined;
            await http.post(`/web/api/admin/members/${member.id}/renew`, {
                plan_id: renewPlanId || member.latest_subscription?.plan?.id || fallbackPlanId,
                auto_renew: renewAuto ? 1 : 0,
            });
            setSuccess(`Renewed ${member.full_name}.`);
            fetchMembers();
            setRenewOpen(false);
            setRenewMember(null);
        } catch (err) {
            setError(err.response?.data?.message ?? `Failed to renew ${member.full_name}.`);
        }
    };

    const handleMessage = async (member) => {
        const title = window.prompt('Message title');
        if (!title) return;
        const body = window.prompt('Message body');
        if (!body) return;
        setError(null);
        setSuccess(null);
        try {
            await http.post(`/web/api/admin/members/${member.id}/message`, { title, body });
            setSuccess(`Message sent to ${member.full_name}.`);
        } catch (err) {
            setError(err.response?.data?.message ?? `Failed to message ${member.full_name}.`);
        }
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'code',
                header: 'Code',
                cell: ({ row }) => (
                    <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                        {row.original.code}
                    </div>
                ),
            },
            {
                accessorKey: 'full_name',
                header: 'Member',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        {row.original.avatar_url ? (
                            <img
                                src={row.original.avatar_url}
                                alt={row.original.full_name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                                <Icon icon="heroicons:user" width="20" />
                            </div>
                        )}
                        <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                {row.original.full_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {row.original.email || '—'}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'branch.name',
                header: 'Branch',
                cell: ({ row }) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.branch?.name || '—'}
                    </span>
                ),
            },
            {
                id: 'plan',
                header: 'Plan',
                cell: ({ row }) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.latest_subscription?.plan?.name || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <Badge variant={row.original.status}>{row.original.status_label}</Badge>
                ),
            },
            {
                accessorKey: 'phone',
                header: 'Contact',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.phone || '—'}
                    </div>
                ),
            },
            {
                accessorKey: 'last_payment_at',
                header: 'Last Payment',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(row.original.last_payment_at)}
                    </div>
                ),
            },
            {
                accessorKey: 'next_expiry_at',
                header: 'Next Expiry',
                cell: ({ row }) => (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(row.original.next_expiry_at)}
                    </div>
                ),
            },
            {
                accessorKey: 'balance_due_cents',
                header: 'Balance',
                cell: ({ row }) => {
                    const balance = row.original.balance_due_cents;
                    const isPositive = balance > 0;
                    return (
                        <div
                            className={`text-right text-sm font-medium ${
                                isPositive
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-gray-900 dark:text-gray-100'
                            }`}
                        >
                            {formatCurrency(balance)}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.visit(route('members.show', row.original.id));
                            }}
                            className="rounded-md p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                            title="View details"
                        >
                            <Icon icon="heroicons:eye" width="18" />
                        </button>
                        {row.original.status !== 'active' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(row.original, 'active');
                                }}
                                className="rounded-md p-1.5 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                                title="Activate"
                            >
                                <Icon icon="heroicons:check-circle" width="18" />
                            </button>
                        )}
                        {row.original.status !== 'suspended' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(row.original, 'suspended');
                                }}
                                className="rounded-md p-1.5 text-amber-600 transition hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                                title="Suspend"
                            >
                                <Icon icon="heroicons:pause-circle" width="18" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openRenew(row.original);
                            }}
                            className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                            title="Renew"
                            disabled={!initialPlans || initialPlans.length === 0}
                        >
                            <Icon icon="heroicons:arrow-path-rounded-square" width="18" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMessage(row.original);
                            }}
                            className="rounded-md p-1.5 text-purple-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                            title="Message member"
                        >
                            <Icon icon="heroicons:envelope" width="18" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingMember(row.original);
                                setDrawerOpen(true);
                            }}
                            className="rounded-md p-1.5 text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                            title="Edit member"
                        >
                            <Icon icon="heroicons:pencil" width="18" />
                        </button>
                        {row.original.deleted_at ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore(row.original);
                                }}
                                className="rounded-md p-1.5 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                                title="Restore member"
                            >
                                <Icon icon="heroicons:arrow-path" width="18" />
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(row.original);
                                }}
                                className="rounded-md p-1.5 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                                title="Archive member"
                            >
                                <Icon icon="heroicons:archive-box" width="18" />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Member Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage your gym members, subscriptions, and attendance.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <SecondaryButton onClick={fetchMembers}>
                            <Icon icon="heroicons:arrow-path" width="16" className="mr-2" />
                            Refresh
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={() => {
                                setEditingMember(null);
                                setDrawerOpen(true);
                            }}
                        >
                            <Icon icon="heroicons:plus" width="16" className="mr-2" />
                            Add Member
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Members" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Server-side Search */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <Icon icon="heroicons:magnifying-glass" width="18" className="text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by code, name, email, or phone..."
                            className="flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                            >
                                <Icon icon="heroicons:x-mark" width="18" />
                            </button>
                        )}
                    </div>
                </div>
                {/* Alert Messages */}
                {(error || success) && (
                    <div
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                            error
                                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300'
                        }`}
                    >
                        <Icon
                            icon={error ? 'heroicons:exclamation-circle' : 'heroicons:check-circle'}
                            width="20"
                        />
                        <span className="text-sm font-medium">{error ?? success}</span>
                        <button
                            onClick={() => {
                                setError(null);
                                setSuccess(null);
                            }}
                            className="ml-auto"
                        >
                            <Icon icon="heroicons:x-mark" width="18" />
                        </button>
                    </div>
                )}

                {/* Filters Section */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Filters
                        </h3>
                        <button
                            onClick={() =>
                                setFilters({
                                    status: [],
                                    plan_status: '',
                                    has_debt: '',
                                    branch_id: '',
                                    deleted: 'without',
                                })
                            }
                            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Reset Filters
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Branch
                            </label>
                            <select
                                value={filters.branch_id}
                                onChange={(e) => updateFilter('branch_id', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="">All Branches</option>
                                {initialBranches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Plan Status
                            </label>
                            <select
                                value={filters.plan_status}
                                onChange={(e) => updateFilter('plan_status', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="">Any</option>
                                <option value="active">Active Plan</option>
                                <option value="expired">Expired Plan</option>
                                <option value="none">No Plan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Financial Status
                            </label>
                            <select
                                value={filters.has_debt}
                                onChange={(e) => updateFilter('has_debt', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="">Any</option>
                                <option value="true">Has Outstanding Balance</option>
                                <option value="false">No Balance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Archived
                            </label>
                            <select
                                value={filters.deleted}
                                onChange={(e) => updateFilter('deleted', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="without">Hide Archived</option>
                                <option value="with">Include Archived</option>
                                <option value="only">Archived Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Member Status
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {STATUSES.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => toggleStatusFilter(status)}
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                                        filters.status.includes(status)
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {filters.status.includes(status) && (
                                        <Icon icon="heroicons:check" width="14" />
                                    )}
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Members Data Table */}
                <DataTable
                    data={members}
                    columns={columns}
                    pageSize={15}
                    showPagination
                    showSearch={false}
                    emptyMessage="No members found. Try adjusting your filters or create a new member."
                    loading={loading}
                    onRowClick={(member) => router.visit(route('members.show', member.id))}
                />
            </div>

            {/* Member Create/Edit Drawer */}
            <MemberDrawer
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setEditingMember(null);
                    setDrawerErrors({});
                }}
                onSubmit={handleSubmitDrawer}
                member={editingMember}
                branches={initialBranches}
                users={initialUsers}
                loading={drawerLoading}
                errors={drawerErrors}
            />

            {/* Renew Dialog */}
            <Transition appear show={renewOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setRenewOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-gray-900">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
                                        <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                            Renew Subscription
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setRenewOpen(false)}
                                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                                        >
                                            <Icon icon="heroicons:x-mark" width="20" />
                                        </button>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                value={renewPlanId}
                                                onChange={(e) => setRenewPlanId(e.target.value)}
                                            >
                                                {initialPlans.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                                                checked={renewAuto}
                                                onChange={(e) => setRenewAuto(e.target.checked)}
                                            />
                                            Auto renew
                                        </label>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                                        <SecondaryButton type="button" onClick={() => setRenewOpen(false)}>Cancel</SecondaryButton>
                                        <PrimaryButton type="button" onClick={() => renewMember && handleRenew(renewMember)} disabled={!renewPlanId}>
                                            Confirm
                                        </PrimaryButton>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}
