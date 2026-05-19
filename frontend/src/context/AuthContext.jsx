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
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, otp) => {
        const response = await api.post('/api/auth/verify-otp', null, {
            params: { email, otp }
        });
        // The backend redirects, but for REST API we want JSON.
        // We need to refactor backend to return JSON for API calls.
        // For now assuming we refactored backend.
        setUser(response.data);
        return response.data;
    };

    const logout = async () => {
        await api.post('/api/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


