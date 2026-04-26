
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { forwardRef } from 'react';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    type = 'button',
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg focus:ring-primary",
        secondary: "bg-secondary text-white hover:bg-secondary-light shadow-md hover:shadow-lg focus:ring-secondary",
        outline: "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary",
        ghost: "text-gray-600 hover:text-primary hover:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            ref={ref}
            type={type}
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
