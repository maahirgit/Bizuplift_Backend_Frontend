
import clsx from 'clsx';

const Card = ({ children, className, hover = true, ...props }) => {
    return (
        <div
            className={clsx(
                "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden",
                hover && "transition-transform hover:-translate-y-1 hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
