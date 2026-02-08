import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Backend URL
    withCredentials: true, // For cookies/session
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
