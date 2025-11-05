import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import SidebarLink from '@/Components/SidebarLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { navigationConfig } from '@/Config/navigation';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const can = auth?.can ?? {};
    const roles = auth?.roles ?? [];

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Check if user is Owner (has full access)
    const isOwner = roles.includes('Owner');

    // Filter navigation based on user permissions
    const hasPermission = (permission) => {
        if (!permission) return true; // No permission required
        if (isOwner) return true; // Owner has access to everything
        return Boolean(can[permission]);
    };

    const filteredNavigation = useMemo(() => {
        // If user is Owner, show all navigation items
        if (isOwner) {
            return navigationConfig;
        }

        // Otherwise, filter based on permissions
        return navigationConfig
            .map((item) => {
                const parentAllowed = hasPermission(item.permission);

                if (item.children && item.children.length > 0) {
                    const allowedChildren = item.children
                        .filter(
                            (child) =>
                                hasPermission(child.permission)
                        )
                        .map((child) => ({ ...child }));

                    if (!parentAllowed && allowedChildren.length === 0) {
                        return null;
                    }

                    return {
                        ...item,
                        children: allowedChildren,
                    };
                }

                if (!parentAllowed) {
                    return null;
                }

                return {
                    ...item,
                };
            })
            .filter(Boolean);
    }, [can, roles, isOwner]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
                    sidebarCollapsed ? 'w-20' : 'w-72'
                } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo area */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
                    {!sidebarCollapsed && (
                        <Link href={route('dashboard')} className="flex items-center">
                            <ApplicationLogo className="h-8 w-auto" width={120} height={32} alt="PrimeX Fitness" />
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:block"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {sidebarCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            )}
                        </svg>
                    </button>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {filteredNavigation.map((item) => (
                        <SidebarLink key={item.name} item={item} isCollapsed={sidebarCollapsed} />
                    ))}
                </nav>

                {/* User section */}
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                    {!sidebarCollapsed ? (
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                <span className="text-sm font-medium">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {user.name}
                                </p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                <span className="text-sm font-medium">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content area */}
            <div
                className={`transition-all duration-300 ${
                    sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
                }`}
            >
                {/* Top navbar */}
                <header className="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Page title */}
                            {header && (
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {header}
                                </h1>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Theme toggle */}
                            <ThemeToggle />

                            {/* Notifications */}
                            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>

                            {/* User menu */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                            <span className="text-xs font-medium">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="hidden sm:inline">{user.name}</span>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
