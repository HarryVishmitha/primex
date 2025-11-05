// resources/js/Components/ApplicationLogo.jsx
import clsx from "clsx";

/**
 * Props:
 *  - className?: string                (applied to both imgs for sizing like "h-10 w-auto")
 *  - alt?: string                      (default "PrimeX Fitness")
 *  - width?: number|string             (optional: helps avoid CLS)
 *  - height?: number|string            (optional)
 *  - priority?: boolean                (eager-load when true)
 *  - variant?: "light" | "dark"        (optional manual override)
 */
export default function ApplicationLogo({
    className = "",
    alt = "PrimeX Fitness",
    width,
    height,
    priority = false,
    variant,
    ...rest
}) {
    const lightSrc = "/assets/logo.webp";
    const darkSrc = "/assets/logo-dark.webp";

    const loading = priority ? "eager" : "lazy";
    const fetchpriority = priority ? "high" : "auto";

    // When variant is forced, show only the chosen one (no dark: classes needed).
    if (variant === "dark") {
        return (
            <img
                src={darkSrc}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                fetchpriority={fetchpriority}
                decoding="async"
                className={className}
                {...rest}
            />
        );
    }
    if (variant === "light") {
        return (
            <img
                src={lightSrc}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                fetchpriority={fetchpriority}
                decoding="async"
                className={className}
                {...rest}
            />
        );
    }

    // Auto mode: Tailwind handles swap via html.dark
    return (
        <span className="inline-block" aria-label={alt}>
            {/* Light logo */}
            <img
                src={lightSrc}
                alt=""
                aria-hidden="true"
                width={width}
                height={height}
                loading={loading}
                fetchpriority={fetchpriority}
                decoding="async"
                className={clsx("block dark:hidden", className)}
                {...rest}
            />
            {/* Dark logo */}
            <img
                src={darkSrc}
                alt=""
                aria-hidden="true"
                width={width}
                height={height}
                loading={loading}
                fetchpriority={fetchpriority}
                decoding="async"
                className={clsx("hidden dark:block", className)}
                {...rest}
            />
        </span>
    );
}
