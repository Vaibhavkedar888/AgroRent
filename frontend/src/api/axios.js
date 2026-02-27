import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 65000, // 65s — covers Render cold start (~30-45s)
    headers: { 'Content-Type': 'application/json' },
});

// ─── Wake-up ping ──────────────────────────────────────────────────────────
// Pings /api/health on page load so Render starts warming up before the user
// even clicks anything. Silently retries up to 3 times.
let serverReady = false;
let wakePromise = null;

export const pingServer = async () => {
    if (serverReady) return true;
    if (wakePromise) return wakePromise;

    wakePromise = (async () => {
        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                await axios.get(`${BASE_URL}/api/health`, { timeout: 15000, withCredentials: false });
                serverReady = true;
                return true;
            } catch {
                // Wait 5s between attempts
                if (attempt < 5) await new Promise(r => setTimeout(r, 5000));
            }
        }
        return false;
    })();

    return wakePromise;
};

// Start pinging immediately on import
pingServer();

// ─── Response interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => {
        serverReady = true; // Any successful response = server is up
        return response;
    },
    (error) => {
        if (!error.response) {
            if (error.code === 'ECONNABORTED') {
                error.userMessage = 'The server is taking too long to respond. It may be waking up — please try again in 30 seconds.';
            } else {
                error.userMessage = 'Cannot reach the server. It may be starting up — please wait 30 seconds and try again.';
            }
        } else {
            error.userMessage = null; // Let component handle HTTP errors
        }
        return Promise.reject(error);
    }
);

// ─── Request interceptor: retry once on network error ─────────────────────
api.interceptors.request.use((config) => {
    config._retryCount = config._retryCount || 0;
    return config;
});

export const apiWithRetry = async (fn, retries = 1) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (!err.response && i < retries) {
                // Network error — wait and retry once
                await new Promise(r => setTimeout(r, 8000));
                continue;
            }
            throw err;
        }
    }
};

export default api;
