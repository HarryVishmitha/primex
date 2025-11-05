import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const STATUSES = ['prospect', 'active', 'inactive', 'suspended'];
const GENDERS = ['male', 'female', 'non_binary', 'undisclosed'];

export default function MembersEdit() {
    const { memberId } = usePage().props;

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
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

            const payload = response.data.data;
            setForm({
                id: payload.id,
                full_name: payload.full_name ?? '',
                email: payload.email ?? '',
                phone: payload.phone ?? '',
                gender: payload.gender ?? '',
                dob: payload.dob ?? '',
                branch_id: payload.branch?.id ?? '',
                status: payload.status ?? 'prospect',
                code: payload.code ?? '',
                emergency_contact: {
                    name: payload.emergency_contact?.name ?? '',
                    phone: payload.emergency_contact?.phone ?? '',
                    relationship: payload.emergency_contact?.relationship ?? '',
                },
                deleted_at: payload.deleted_at,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    'Failed to load member. Please return to the list and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMember();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId]);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleEmergency = (key, value) => {
        setForm((prev) => ({
            ...prev,
            emergency_contact: { ...prev.emergency_contact, [key]: value },
        }));
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!form) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        const payload = { ...form };
        delete payload.id;
        delete payload.deleted_at;

        if (
            !payload.emergency_contact?.name &&
            !payload.emergency_contact?.phone &&
            !payload.emergency_contact?.relationship
        ) {
            delete payload.emergency_contact;
        }

        try {
            await http.put(`/api/admin/members/${memberId}`, payload);
            setSuccess('Member updated successfully.');
            router.visit(route('members.show', memberId));
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    'Failed to update member. Please review the form.'
            );
        } finally {
            setSaving(false);
        }
    };

    const archive = async () => {
        if (!form) return;
        setError(null);
        setSuccess(null);

        try {
            await http.delete(`/api/admin/members/${memberId}`);
            setSuccess('Member archived.');
            fetchMember();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Unable to archive member.');
        }
    };

    const restore = async () => {
        if (!form) return;
        setError(null);
        setSuccess(null);

        try {
            await http.post(`/api/admin/members/${memberId}/restore`);
            setSuccess('Member restored.');
            fetchMember();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Unable to restore member.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Edit Member
                    </h2>
                    <Link
                        href={route('members.show', memberId)}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        Back to profile
                    </Link>
                </div>
            }
        >
            <Head title="Edit Member" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl space-y-6">
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

                    {loading || !form ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                            Loading member details...
                        </div>
                    ) : (
                        <form
                            onSubmit={submit}
                            className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                        >
                            <section className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Full Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={form.full_name}
                                        onChange={(e) => handleChange('full_name', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Branch ULID
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={form.branch_id}
                                        onChange={(e) => handleChange('branch_id', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
                                        Gender
                                    </label>
                                    <select
                                        value={form.gender}
                                        onChange={(e) => handleChange('gender', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    >
                                        <option value="">Select gender</option>
                                        {GENDERS.map((gender) => (
                                            <option key={gender} value={gender}>
                                                {gender}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={form.dob ?? ''}
                                        onChange={(e) => handleChange('dob', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Member Code
                                    </label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) => handleChange('code', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Emergency Contact
                                </h3>
                                <div className="mt-3 grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.emergency_contact.name}
                                            onChange={(e) => handleEmergency('name', e.target.value)}
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={form.emergency_contact.phone}
                                            onChange={(e) => handleEmergency('phone', e.target.value)}
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Relationship
                                        </label>
                                        <input
                                            type="text"
                                            value={form.emergency_contact.relationship}
                                            onChange={(e) =>
                                                handleEmergency('relationship', e.target.value)
                                            }
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {form.deleted_at ? (
                                        <button
                                            type="button"
                                            onClick={restore}
                                            className="rounded-md border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                                        >
                                            Restore
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={archive}
                                            className="rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-900/30"
                                        >
                                            Archive
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('members.show', memberId)}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                                    >
                                        {saving ? 'Saving...' : 'Save changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

