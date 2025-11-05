import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const STATUSES = ['prospect', 'active', 'inactive', 'suspended'];
const GENDERS = ['male', 'female', 'non_binary', 'undisclosed'];

export default function MembersCreate() {
    const { auth } = usePage().props;
    const defaultBranch = auth?.user?.branch_id ?? '';

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        branch_id: defaultBranch,
        status: 'prospect',
        code: '',
        emergency_contact: { name: '', phone: '', relationship: '' },
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const http = useMemo(() => window.axios, []);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleEmergency = (key, value) => {
        setForm((prev) => ({
            ...prev,
            emergency_contact: {
                ...prev.emergency_contact,
                [key]: value,
            },
        }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmitting(true);

        const payload = { ...form };
        if (
            !payload.emergency_contact?.name &&
            !payload.emergency_contact?.phone &&
            !payload.emergency_contact?.relationship
        ) {
            delete payload.emergency_contact;
        }

        try {
            await http.post('/api/admin/members', {
                ...payload,
                branch_id: payload.branch_id || defaultBranch,
            });
            setSuccess('Member created successfully.');
            router.visit(route('members.index'));
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    'Failed to create member. Please review the form.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Create Member
                    </h2>
                    <Link
                        href={route('members.index')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        Back to list
                    </Link>
                </div>
            }
        >
            <Head title="Create Member" />

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
                                <p className="mt-1 text-xs text-gray-400">
                                    Defaults to your branch when left blank.
                                </p>
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
                                    value={form.dob}
                                    onChange={(e) => handleChange('dob', e.target.value)}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Manual Code (optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => handleChange('code', e.target.value)}
                                    placeholder="Will auto-generate when blank"
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Emergency Contact <span className="text-xs font-normal text-gray-500">(optional)</span>
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

                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={route('members.index')}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                            >
                                {submitting ? 'Saving...' : 'Create Member'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

