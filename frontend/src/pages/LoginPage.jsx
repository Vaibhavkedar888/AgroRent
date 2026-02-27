import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import api from '../api/axios';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('EMAIL'); // EMAIL | OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sentEmail, setSentEmail] = useState('');
    const [userName, setUserName] = useState('');

    // STEP 1 — request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/auth/login', null, {
                params: { email: email.trim().toLowerCase() }
            });
            setSentEmail(res.data.email || email);
            setUserName(res.data.name || '');
            setStep('OTP');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // STEP 2 — verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(email.trim().toLowerCase(), otp.trim());
            if (user.role === 'FARMER') navigate('/farmer/dashboard');
            else if (user.role === 'OWNER') navigate('/owner/dashboard');
            else if (user.role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: `url('https://media.istockphoto.com/id/487277894/photo/farmer-spreads-fertilizers-in-the-field-of-paddy-rice-plants.jpg?s=612x612&w=0&k=20&c=78DTfPZJ12t_3pLOxecxqNEhEYOk1ZTMhKrogLjGux8=')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="text-center">
                    <div className="text-4xl mb-3">🌾</div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {step === 'EMAIL' ? 'Welcome Back' : `Hello${userName ? ', ' + userName.split(' ')[0] : ''}!`}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {step === 'EMAIL'
                            ? 'Enter your registered email to receive an OTP'
                            : `OTP sent to ${sentEmail} — check your inbox`}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Step 1: Email Form */}
                {step === 'EMAIL' && (
                    <form className="mt-6 space-y-5" onSubmit={handleRequestOtp}>
                        <div className="relative">
                            <Mail className="absolute top-3.5 left-3 text-gray-400" size={18} />
                            <input
                                id="email-input"
                                type="email"
                                required
                                autoComplete="email"
                                className="pl-10 block w-full rounded-xl border border-gray-300 py-3 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            id="send-otp-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : (
                                <><span>Send OTP</span><ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Form */}
                {step === 'OTP' && (
                    <form className="mt-6 space-y-5" onSubmit={handleVerifyOtp}>
                        <div className="relative">
                            <Lock className="absolute top-3.5 left-3 text-gray-400" size={18} />
                            <input
                                id="otp-input"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                                autoComplete="one-time-code"
                                className="pl-10 block w-full rounded-xl border border-gray-300 py-3 pr-4 text-gray-900 placeholder-gray-400 text-center tracking-[0.4em] text-xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setStep('EMAIL'); setOtp(''); setError(''); }}
                                className="w-1/3 py-3 px-4 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                id="verify-otp-btn"
                                type="submit"
                                disabled={loading}
                                className="w-2/3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60"
                            >
                                {loading ? <Loader className="animate-spin" size={18} /> : 'Verify & Login'}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400">
                            Didn't receive it?{' '}
                            <button
                                type="button"
                                className="text-green-600 font-medium hover:underline"
                                onClick={handleRequestOtp}
                            >
                                Resend OTP
                            </button>
                        </p>
                    </form>
                )}

                <div className="text-center border-t pt-4">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-green-600 hover:text-green-700">
                            Register here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
