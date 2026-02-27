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
            // We need an endpoint to check current session.
            // Ideally backend should have /api/auth/me
            // For now we assume if we make a request and get 401, we are logged out.
            // But we will implement a proper check later.
            // Skipping for now, defaulting to null.
            const response = await api.get('/api/auth/me'); // We need to add this endpoint
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (phoneNumber, otp) => {
        const response = await api.post('/api/auth/verify-otp', null, {
            params: { phoneNumber, otp }
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
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


