import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL, // Dynamic Backend URL
    withCredentials: true, // For cookies/session
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
