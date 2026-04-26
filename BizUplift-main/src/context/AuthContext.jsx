import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: restore session from localStorage token
    useEffect(() => {
        const storedToken = localStorage.getItem('bizuplift_token');
        const storedUser = localStorage.getItem('bizuplift_currentUser');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setCurrentUser(JSON.parse(storedUser));
            // Verify token is still valid with the server
            api.get('/auth/me').then(data => {
                // The api helper already unwraps .data if present, but /auth/me returns { success, user }
                const user = data?.user || data;
                setCurrentUser(user);
                localStorage.setItem('bizuplift_currentUser', JSON.stringify(user));
            }).catch(() => {
                // Token expired or invalid, clear session
                localStorage.removeItem('bizuplift_token');
                localStorage.removeItem('bizuplift_currentUser');
                setToken(null);
                setCurrentUser(null);
            });
        }
        setLoading(false);
    }, []);

    const _storeSession = (token, user) => {
        setToken(token);
        setCurrentUser(user);
        localStorage.setItem('bizuplift_token', token);
        localStorage.setItem('bizuplift_currentUser', JSON.stringify(user));
    };

    // Email + Password Login — calls POST /api/auth/login
    const login = async (email, password) => {
        const json = await api.post('/auth/login', { email, password });
        // Backend returns { success, token, user }
        const { token, user } = json;
        if (!token) throw new Error('Login failed: no token received');
        _storeSession(token, user);
        return user;
    };

    // Register — calls POST /api/auth/register
    const register = async (name, email, password, mobile, role) => {
        const json = await api.post('/auth/register', { name, email, password, mobile, role });
        const { token, user } = json;
        if (!token) throw new Error('Registration failed: no token received');
        _storeSession(token, user);
        return user;
    };

    // Google SSO — sends decoded Google profile to backend, backend creates/finds the user
    const loginWithGoogle = async (decodedToken) => {
        const json = await api.post('/auth/google', {
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture,
        });
        const { token, user } = json;
        if (!token) throw new Error('Google login failed: no token received');
        _storeSession(token, user);
        return user;
    };

    const logout = () => {
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('bizuplift_token');
        localStorage.removeItem('bizuplift_currentUser');
    };

    const updateCurrentUser = async (updates) => {
        const data = await api.put('/users/profile', updates);
        const updatedUser = data.user || data;
        setCurrentUser(updatedUser);
        localStorage.setItem('bizuplift_currentUser', JSON.stringify(updatedUser));
        return updatedUser;
    };

    const isAuthenticated = !!currentUser && !!token;
    const isCustomer = currentUser?.role === 'customer';
    const isSeller = currentUser?.role === 'seller';
    const isAdmin = currentUser?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            currentUser, token, loading,
            isAuthenticated, isCustomer, isSeller, isAdmin,
            login, register, loginWithGoogle, logout, updateCurrentUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
