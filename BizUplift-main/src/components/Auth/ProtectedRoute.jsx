import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * - While auth state is loading: shows a spinner to avoid flicker.
 * - If not authenticated: shows a "Login Required" toast and redirects to /login,
 *   saving the intended path in location.state.from so Auth.jsx redirects back after login.
 * - If authenticated: renders children normally.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const { showToast } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (!loading && !isAuthenticated && !hasRedirected.current) {
            hasRedirected.current = true;
            showToast('🔒 Login Required — Please sign in to continue', 'error');
            navigate('/login', { state: { from: location }, replace: true });
        }
    }, [loading, isAuthenticated, navigate, location, showToast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
                        style={{ borderTopColor: 'rgb(var(--color-primary))' }} />
                    <p className="text-sm text-gray-500 font-body">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return children;
};

export default ProtectedRoute;
