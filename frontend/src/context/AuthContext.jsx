import { useState, useEffect } from 'react';
import api from '../api/axios';
import { AuthContext } from './useAuth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/api/auth/me');
            setUser(response.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login: verify OTP by email
     * @param {string} email
     * @param {string} otp
     */
    const login = async (email, otp) => {
        const response = await api.post('/api/auth/verify-otp', null, {
            params: { email, otp }
        });
        setUser(response.data);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch {
            // ignore network errors on logout
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
