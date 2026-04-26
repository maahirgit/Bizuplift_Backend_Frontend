
import clsx from 'clsx';

const Badge = ({ children, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        neutral: "bg-gray-100 text-gray-800",
    };

    return (
        <span
            className={clsx(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
