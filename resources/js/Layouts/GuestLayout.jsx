// resources/js/Layouts/GuestLayout.jsx
import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, Head } from "@inertiajs/react";
import ThemeToggle from "@/Components/ThemeToggle";

export default function GuestLayout({
    children,
    title = "PrimeX — Sign in",
    description = "Access your PrimeX Fitness account to manage memberships, classes, and more.",
}) {
    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
            </Head>

            <div className="min-h-screen w-full bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
                <div className="absolute right-4 top-4">
                    <ThemeToggle />
                </div>
                {/* Center container */}
                <div className="mx-auto flex min-h-screen max-w-[96rem] flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                    {/* Brand / Logo */}
                    <div className="flex flex-col items-center gap-3">
                        <Link
                            href="/"
                            aria-label="Go to homepage"
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
                        >
                            {/* Rectangle logo: height-controlled, width auto */}
                            <ApplicationLogo
                                className="h-10 w-auto sm:h-12"
                                width={192}
                                height={48}
                                priority
                                // variant={'light'}
                            />
                        </Link>

                        {/* Optional subtitle/tagline (shows even in dark mode) */}
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                            Welcome to PrimeX Fitness
                        </p>
                    </div>

                    {/* Card */}
                    <section
                        aria-label="Authentication"
                        className="mt-8 w-full sm:max-w-md"
                    >
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                            {children}
                        </div>

                        {/* Small helper footer */}
                        <div className="mt-4 text-center text-xs text-gray-500 dark:text-slate-500">
                            <span>Having trouble? </span>
                            <a
                                href="#support"
                                className="font-medium text-gray-700 underline decoration-dashed underline-offset-4 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
                            >
                                Contact support
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
