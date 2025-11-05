import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { icons } from '@/Config/navigation';

const resolveHref = (name) => {
    if (!name) {
        return '#';
    }

    try {
        return route(name);
    } catch (error) {
        console.warn(`Navigation route "${name}" could not be generated.`, error);
        return '#';
    }
};

export default function SidebarLink({ item, isCollapsed }) {
    const page = usePage();

    const currentRouteName = useMemo(() => {
        try {
            return route().current();
        } catch (error) {
            console.warn('Unable to determine the current route name.', error);
            return null;
        }
    }, [page.url]);

    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const IconComponent = item.icon ? icons[item.icon] : null;

    const isActive = (href) => {
        if (!href) return false;
        return (
            currentRouteName === href ||
            currentRouteName?.startsWith(`${href}.`)
        );
    };

    const childActive =
        hasChildren && item.children.some((child) => isActive(child.href));
    const itemActive = !hasChildren && isActive(item.href);

    const [isOpen, setIsOpen] = useState(() => childActive);

    useEffect(() => {
        if (childActive) {
            setIsOpen(true);
        }
    }, [childActive]);

    if (hasChildren) {
        const ChevronIcon = isOpen
            ? icons.ChevronDownIcon
            : icons.ChevronRightIcon;

        return (
            <div>
                <button
                    onClick={() => setIsOpen((open) => !open)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        childActive
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`}
                >
                    <div className="flex items-center">
                        {IconComponent && (
                            <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                        )}
                        {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && ChevronIcon && (
                        <ChevronIcon className="h-4 w-4 flex-shrink-0 transition-transform" />
                    )}
                </button>

                {isOpen && !isCollapsed && (
                    <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                            <Link
                                key={child.name}
                                href={resolveHref(child.href)}
                                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive(child.href)
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                                }`}
                            >
                                {child.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={resolveHref(item.href)}
            className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                itemActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
            title={isCollapsed ? item.name : undefined}
        >
            {IconComponent && (
                <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
            )}
            {!isCollapsed && <span>{item.name}</span>}
        </Link>
    );
}
