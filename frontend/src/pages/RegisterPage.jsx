import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Loader, Briefcase, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import ServerStatus from '../components/ServerStatus';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        phoneNumber: '',
        fullName: '',
        email: '',
        role: 'FARMER',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Client-side validation
        if (!formData.email.trim()) {
            setError('Email address is required — it is used to receive your OTP for login.');
            setLoading(false);
            return;
        }
        if (!formData.phoneNumber.trim()) {
            setError('Phone number is required.');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/api/auth/register', {
                ...formData,
                email: formData.email.trim().toLowerCase(),
                phoneNumber: formData.phoneNumber.trim()
            });

            const registeredEmail = res.data.email || formData.email.trim().toLowerCase();
            setSuccess(res.data.message);

            // Redirect to login with email pre-filled after 2s
            setTimeout(() => {
                navigate('/login', { state: { email: registeredEmail, fromRegister: true } });
            }, 2000);

        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
            setError(msg);
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
                className="max-w-2xl w-full space-y-6 bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="text-center">
                    <div className="text-4xl mb-2">🌱</div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Join AgroRent to rent or list farming equipment
                    </p>
                </div>

                {/* Server Wake-up Status */}
                <ServerStatus />

                {/* Success Banner */}
                {success && (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm">
                        <CheckCircle size={20} className="shrink-0" />
                        <div>
                            <p className="font-semibold">{success}</p>
                            <p className="text-xs mt-0.5">Redirecting to login page…</p>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['FARMER', 'OWNER'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: r })}
                                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${formData.role === r
                                        ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
                                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    {r === 'FARMER' ? <User size={16} /> : <Briefcase size={16} />}
                                    {r === 'FARMER' ? 'Farmer' : 'Equipment Owner'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Full Name */}
                        <div className="relative">
                            <User className="absolute top-3.5 left-3 text-gray-400" size={16} />
                            <input
                                name="fullName"
                                type="text"
                                required
                                className="pl-9 block w-full rounded-xl border border-gray-300 py-3 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Full Name *"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Phone */}
                        <div className="relative">
                            <Phone className="absolute top-3.5 left-3 text-gray-400" size={16} />
                            <input
                                name="phoneNumber"
                                type="tel"
                                required
                                pattern="[0-9]{10}"
                                className="pl-9 block w-full rounded-xl border border-gray-300 py-3 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Phone Number (10 digits) *"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email — required for OTP */}
                        <div className="relative md:col-span-2">
                            <Mail className="absolute top-3.5 left-3 text-gray-400" size={16} />
                            <input
                                name="email"
                                type="email"
                                required
                                className="pl-9 block w-full rounded-xl border border-gray-300 py-3 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Email Address * (OTP will be sent here)"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Address */}
                        <div className="relative md:col-span-2">
                            <MapPin className="absolute top-3.5 left-3 text-gray-400" size={16} />
                            <input
                                name="address"
                                type="text"
                                className="pl-9 block w-full rounded-xl border border-gray-300 py-3 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Full Address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        {/* City */}
                        <input
                            name="city"
                            type="text"
                            className="block w-full rounded-xl border border-gray-300 py-3 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                        />

                        {/* State */}
                        <input
                            name="state"
                            type="text"
                            className="block w-full rounded-xl border border-gray-300 py-3 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                        />

                        {/* Pincode */}
                        <div className="relative">
                            <input
                                name="pincode"
                                type="text"
                                className="block w-full rounded-xl border border-gray-300 py-3 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        id="register-btn"
                        type="submit"
                        disabled={loading || !!success}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60 mt-2"
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : '🌱 Create Account'}
                    </button>
                </form>

                <div className="text-center border-t pt-4">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
