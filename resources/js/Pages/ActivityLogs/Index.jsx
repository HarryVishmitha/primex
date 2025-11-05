import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Icon } from '@iconify/react';
import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';

export default function Index({ activities, filters, logNames, events }) {
    const [search, setSearch] = useState(filters.search || '');
    const [logName, setLogName] = useState(filters.log_name || '');
    const [event, setEvent] = useState(filters.event || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [sorting, setSorting] = useState([]);

    const handleFilter = () => {
        router.get(route('activity-logs.index'), {
            search,
            log_name: logName,
            event,
            from_date: fromDate,
            to_date: toDate,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setLogName('');
        setEvent('');
        setFromDate('');
        setToDate('');
        router.get(route('activity-logs.index'));
    };

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

    // Define columns for TanStack Table
    const columns = useMemo(
        () => [
            {
                accessorKey: 'created_at',
                header: 'Time',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {row.original.created_at_human}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {row.original.created_at}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'causer',
                header: 'User',
                cell: ({ row }) => (
                    row.original.causer ? (
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {row.original.causer.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {row.original.causer.email}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">System</span>
                    )
                ),
            },
            {
                accessorKey: 'log_name',
                header: 'Module',
                cell: ({ row }) => (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogNameColor(row.original.log_name)}`}>
                        {row.original.log_name ? row.original.log_name.replace('_', ' ') : 'N/A'}
                    </span>
                ),
            },
            {
                accessorKey: 'event',
                header: 'Event',
                cell: ({ row }) => (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventColor(row.original.event)}`}>
                        {row.original.event || 'N/A'}
                    </span>
                ),
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => (
                    <span className="text-gray-900 dark:text-gray-100">
                        {row.original.description}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="text-right">
                        <Link
                            href={route('activity-logs.show', row.original.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                        >
                            <Icon icon="mdi:eye" className="w-5 h-5" />
                        </Link>
                    </div>
                ),
            },
        ],
        []
    );

    // Initialize table
    const table = useReactTable({
        data: activities.data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Activity Logs
                    </h2>
                </div>
            }
        >
            <Head title="Activity Logs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Filters Card */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                        placeholder="Search description..."
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                    />
                                </div>

                                {/* Module Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Module
                                    </label>
                                    <select
                                        value={logName}
                                        onChange={(e) => setLogName(e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                    >
                                        <option value="">All Modules</option>
                                        {logNames.map((name) => (
                                            <option key={name} value={name}>
                                                {name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Event Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Event
                                    </label>
                                    <select
                                        value={event}
                                        onChange={(e) => setEvent(e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                    >
                                        <option value="">All Events</option>
                                        {events.map((evt) => (
                                            <option key={evt} value={evt}>
                                                {evt.charAt(0).toUpperCase() + evt.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* From Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                    />
                                </div>

                                {/* To Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={handleFilter}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                    >
                                        <Icon icon="mdi:filter" className="w-4 h-4 mr-1" />
                                        Filter
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                    >
                                        <Icon icon="mdi:refresh" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Logs Table */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            {...{
                                                                className: header.column.getCanSort()
                                                                    ? 'cursor-pointer select-none flex items-center gap-2'
                                                                    : '',
                                                                onClick: header.column.getToggleSortingHandler(),
                                                            }}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                            {header.column.getCanSort() && (
                                                                <span className="text-gray-400">
                                                                    {{
                                                                        asc: <Icon icon="mdi:arrow-up" className="w-4 h-4" />,
                                                                        desc: <Icon icon="mdi:arrow-down" className="w-4 h-4" />,
                                                                    }[header.column.getIsSorted()] ?? <Icon icon="mdi:unfold-more-horizontal" className="w-4 h-4" />}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {activities.data.length > 0 ? (
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                {row.getVisibleCells().map(cell => (
                                                    <td
                                                        key={cell.id}
                                                        className="px-6 py-4 text-sm"
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <Icon icon="mdi:file-document-outline" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium">No activity logs found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {activities.data.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {activities.prev_page_url && (
                                        <Link
                                            href={activities.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {activities.next_page_url && (
                                        <Link
                                            href={activities.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing <span className="font-medium">{activities.from}</span> to{' '}
                                            <span className="font-medium">{activities.to}</span> of{' '}
                                            <span className="font-medium">{activities.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {activities.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-600 text-indigo-600 dark:text-indigo-300'
                                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                        index === activities.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
