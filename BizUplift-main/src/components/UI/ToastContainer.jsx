import { useNotifications } from '../../context/NotificationContext';

const ToastContainer = () => {
    const { toasts, dismissToast } = useNotifications();

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto max-w-sm animate-fade-in-up ${colors[toast.type] || colors.success}`}
                    style={{ animation: 'fadeInUp 0.3s ease-out' }}
                >
                    <span className="text-lg flex-shrink-0">{icons[toast.type] || icons.success}</span>
                    <p className="text-sm font-medium flex-1">{toast.message}</p>
                    <button onClick={() => dismissToast(toast.id)} className="text-current opacity-50 hover:opacity-100 flex-shrink-0">✕</button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
