import { Icon } from '@iconify/react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

const DataTable = ({
    data = [],
    columns = [],
    pageSize = 10,
    showPagination = true,
    showSearch = true,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No data available',
    loading = false,
    onRowClick,
    className = '',
}) => {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize,
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
        enableSorting: true,
        enableFilters: true,
        enableGlobalFilter: true,
    });

    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;

    const getPageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 7;

        if (pageCount <= maxVisible) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(pageCount);
            } else if (currentPage >= pageCount - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = pageCount - 4; i <= pageCount; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(pageCount);
            }
        }

        return pages;
    }, [pageCount, currentPage]);

    return (
        <div className={`space-y-4 ${className}`}>
            {showSearch && (
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Icon
                            icon="heroicons:magnifying-glass"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                            width="20"
                        />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                        />
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? 'flex cursor-pointer select-none items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200'
                                                            : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {header.column.getCanSort() && (
                                                        <span className="inline-flex">
                                                            {header.column.getIsSorted() ===
                                                            'asc' ? (
                                                                <Icon
                                                                    icon="heroicons:chevron-up"
                                                                    width="16"
                                                                />
                                                            ) : header.column.getIsSorted() ===
                                                              'desc' ? (
                                                                <Icon
                                                                    icon="heroicons:chevron-down"
                                                                    width="16"
                                                                />
                                                            ) : (
                                                                <Icon
                                                                    icon="heroicons:chevron-up-down"
                                                                    width="16"
                                                                    className="opacity-30"
                                                                />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon
                                                icon="svg-spinners:ring-resize"
                                                width="24"
                                                className="text-indigo-600 dark:text-indigo-400"
                                            />
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Icon
                                                icon="heroicons:inbox"
                                                width="48"
                                                className="text-gray-300 dark:text-gray-700"
                                            />
                                            <p>{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                        className={
                                            onRowClick
                                                ? 'cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                : 'transition hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {showPagination && pageCount > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    data.length
                                )}{' '}
                                of {data.length} results
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <Icon icon="heroicons:chevron-left" width="16" />
                            </button>

                            <div className="flex gap-1">
                                {getPageNumbers.map((page, idx) =>
                                    page === '...' ? (
                                        <span
                                            key={`ellipsis-${idx}`}
                                            className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => table.setPageIndex(page - 1)}
                                            className={`h-8 w-8 rounded-md text-sm font-medium transition ${
                                                currentPage === page
                                                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <Icon icon="heroicons:chevron-right" width="16" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
