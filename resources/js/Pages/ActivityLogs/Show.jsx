import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Icon } from '@iconify/react';

export default function Show({ activity }) {
    const getEventColor = (eventName) => {
        switch (eventName) {
            case 'created':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'updated':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'deleted':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getLogNameColor = (name) => {
        const colors = {
            member: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            subscription: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
            payment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
            invoice: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
            attendance: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
            class_booking: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
            user: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
        };
        return colors[name] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const renderProperties = (properties) => {
        if (!properties || Object.keys(properties).length === 0) {
            return <p className="text-gray-500 dark:text-gray-400 italic">No properties available</p>;
        }

        return (
            <div className="space-y-4">
                {properties.attributes && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Values</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                                {JSON.stringify(properties.attributes, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {properties.old && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Old Values</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                                {JSON.stringify(properties.old, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {!properties.attributes && !properties.old && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                            {JSON.stringify(properties, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('activity-logs.index')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        >
                            <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Activity Log Details
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Activity Log Details" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Main Activity Info */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 space-y-6">
                            {/* Header Section */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {activity.description}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {activity.created_at_human} • {activity.created_at}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEventColor(activity.event)}`}>
                                        {activity.event || 'N/A'}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLogNameColor(activity.log_name)}`}>
                                        {activity.log_name ? activity.log_name.replace('_', ' ') : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-700"></div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* User Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Performed By
                                    </h4>
                                    {activity.causer ? (
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                                        <Icon icon="mdi:account" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {activity.causer.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {activity.causer.email}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        ID: {activity.causer.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                            <p className="text-gray-500 dark:text-gray-400 italic flex items-center">
                                                <Icon icon="mdi:robot" className="w-5 h-5 mr-2" />
                                                System Action
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Subject Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Subject
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Type:</span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {activity.subject_type || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">ID:</span>
                                            <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                                {activity.subject_id || 'N/A'}
                                            </p>
                                        </div>
                                        {activity.batch_uuid && (
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Batch UUID:</span>
                                                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                                                    {activity.batch_uuid}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Properties Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Changes & Properties
                            </h3>
                            {renderProperties(activity.properties)}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                        <Link
                            href={route('activity-logs.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                        >
                            <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
                            Back to List
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
