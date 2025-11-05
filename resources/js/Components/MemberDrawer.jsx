import { Icon } from '@iconify/react';
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const MemberDrawer = ({
    open = false,
    onClose,
    onSubmit,
    member = null,
    branches = [],
    loading = false,
    errors = {},
}) => {
    const isEdit = !!member;
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        branch_id: '',
        status: 'prospect',
        code: '',
        emergency_contact: {
            name: '',
            phone: '',
            relationship: '',
        },
    });

    useEffect(() => {
        if (member) {
            setFormData({
                full_name: member.full_name || '',
                email: member.email || '',
                phone: member.phone || '',
                gender: member.gender || '',
                dob: member.dob || '',
                branch_id: member.branch?.id || '',
                status: member.status || 'prospect',
                code: member.code || '',
                emergency_contact: member.emergency_contact || {
                    name: '',
                    phone: '',
                    relationship: '',
                },
            });
        } else {
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                gender: '',
                dob: '',
                branch_id: branches[0]?.id || '',
                status: 'prospect',
                code: '',
                emergency_contact: {
                    name: '',
                    phone: '',
                    relationship: '',
                },
            });
        }
    }, [member, branches, open]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleEmergencyContactChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            emergency_contact: {
                ...prev.emergency_contact,
                [field]: value,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-gray-900">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
                                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {isEdit ? 'Edit Member' : 'Create New Member'}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                                    >
                                        <Icon icon="heroicons:x-mark" width="24" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                    {/* Basic Information */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Basic Information
                                        </h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <InputLabel htmlFor="full_name" value="Full Name *" />
                                                <TextInput
                                                    id="full_name"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={formData.full_name}
                                                    onChange={(e) => handleChange('full_name', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.full_name} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="email" value="Email" />
                                                <TextInput
                                                    id="email"
                                                    type="email"
                                                    className="mt-1 block w-full"
                                                    value={formData.email}
                                                    onChange={(e) => handleChange('email', e.target.value)}
                                                />
                                                <InputError message={errors.email} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="phone" value="Phone" />
                                                <TextInput
                                                    id="phone"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={formData.phone}
                                                    onChange={(e) => handleChange('phone', e.target.value)}
                                                />
                                                <InputError message={errors.phone} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="gender" value="Gender" />
                                                <select
                                                    id="gender"
                                                    value={formData.gender}
                                                    onChange={(e) => handleChange('gender', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                >
                                                    <option value="">Prefer not to say</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="non_binary">Non-binary</option>
                                                    <option value="undisclosed">Undisclosed</option>
                                                </select>
                                                <InputError message={errors.gender} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="dob" value="Date of Birth" />
                                                <TextInput
                                                    id="dob"
                                                    type="date"
                                                    className="mt-1 block w-full"
                                                    value={formData.dob}
                                                    onChange={(e) => handleChange('dob', e.target.value)}
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                                <InputError message={errors.dob} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Membership Details */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Membership Details
                                        </h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="branch_id" value="Branch *" />
                                                <select
                                                    id="branch_id"
                                                    value={formData.branch_id}
                                                    onChange={(e) => handleChange('branch_id', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    required
                                                >
                                                    <option value="">Select a branch</option>
                                                    {branches.map((branch) => (
                                                        <option key={branch.id} value={branch.id}>
                                                            {branch.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.branch_id} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="status" value="Status" />
                                                <select
                                                    id="status"
                                                    value={formData.status}
                                                    onChange={(e) => handleChange('status', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                >
                                                    <option value="prospect">Prospect</option>
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                                <InputError message={errors.status} className="mt-2" />
                                            </div>

                                            {!isEdit && (
                                                <div className="sm:col-span-2">
                                                    <InputLabel htmlFor="code" value="Member Code (Optional)" />
                                                    <TextInput
                                                        id="code"
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={formData.code}
                                                        onChange={(e) => handleChange('code', e.target.value)}
                                                        placeholder="Auto-generated if left blank"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Leave blank to auto-generate a unique code
                                                    </p>
                                                    <InputError message={errors.code} className="mt-2" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Emergency Contact */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Emergency Contact
                                        </h3>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <InputLabel htmlFor="emergency_name" value="Name" />
                                                <TextInput
                                                    id="emergency_name"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={formData.emergency_contact.name}
                                                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="emergency_phone" value="Phone" />
                                                <TextInput
                                                    id="emergency_phone"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={formData.emergency_contact.phone}
                                                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="emergency_relationship" value="Relationship" />
                                                <TextInput
                                                    id="emergency_relationship"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={formData.emergency_contact.relationship}
                                                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                                        <SecondaryButton type="button" onClick={onClose}>
                                            Cancel
                                        </SecondaryButton>
                                        <PrimaryButton type="submit" disabled={loading}>
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="svg-spinners:ring-resize" width="16" />
                                                    <span>Saving...</span>
                                                </div>
                                            ) : isEdit ? (
                                                'Update Member'
                                            ) : (
                                                'Create Member'
                                            )}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default MemberDrawer;
