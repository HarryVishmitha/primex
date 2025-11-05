const Badge = ({ variant = 'default', children, className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        prospect: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        inactive: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        suspended: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };

    const variantClass = variants[variant] || variants.default;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${variantClass} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
