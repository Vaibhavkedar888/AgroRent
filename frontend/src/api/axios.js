import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true, // Required for cross-origin session cookies
    timeout: 60000,        // 60s — allows Render free tier cold start (~30s)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: surface readable error messages
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // No response = network error or server down
            if (error.code === 'ECONNABORTED') {
                error.message = 'Request timed out. The server may be waking up — please try again.';
            } else {
                error.message = 'Cannot connect to the server. Please check your connection or try again in a moment.';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
