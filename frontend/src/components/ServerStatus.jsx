import { useState, useEffect } from 'react';
import { pingServer } from '../api/axios';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * Shows a warning banner if the backend server is unreachable (Render cold start).
 * Automatically pings /api/health and updates when server responds.
 */
const ServerStatus = () => {
    const [status, setStatus] = useState('checking'); // checking | up | down

    useEffect(() => {
        let alive = true;

        const check = async () => {
            setStatus('checking');
            const ok = await pingServer();
            if (alive) setStatus(ok ? 'up' : 'down');
        };

        check();
        return () => { alive = false; };
    }, []);

    if (status === 'up') return null; // Don't show anything when server is up

    if (status === 'checking') {
        return (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                <RefreshCw size={16} className="animate-spin shrink-0" />
                <span>
                    <strong>Connecting to server…</strong> This may take 30–60 seconds if the server is waking up (free tier).
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <div className="flex items-center gap-2">
                <WifiOff size={16} className="shrink-0" />
                <span><strong>Server is unreachable.</strong> Please wait and try again.</span>
            </div>
            <button
                onClick={() => window.location.reload()}
                className="text-xs underline whitespace-nowrap font-medium"
            >
                Retry
            </button>
        </div>
    );
};

export default ServerStatus;
