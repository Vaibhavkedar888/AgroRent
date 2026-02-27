import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Loader, Briefcase } from 'lucide-react';
import api from '../api/axios';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        try {
            await api.post('/api/auth/register', formData);
            // Redirect to login with phone number pre-filled would be nice, but simple redirect for now
            navigate('/login');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
            setError(errorMsg);
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
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full space-y-8 bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join Krushak to rent or list farming equipment
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Role Selection */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'FARMER' })}
                                    className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 ${formData.role === 'FARMER'
                                        ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <User size={18} /> Farmer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                                    className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 ${formData.role === 'OWNER'
                                        ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Briefcase size={18} /> Equipment Owner
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <User className="absolute top-3 left-3 text-gray-400" size={18} />
                            <input
                                name="fullName"
                                type="text"
                                required
                                className="pl-10 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute top-3 left-3 text-gray-400" size={18} />
                            <input
                                name="phoneNumber"
                                type="tel"
                                required
                                className="pl-10 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute top-3 left-3 text-gray-400" size={18} />
                            <input
                                name="email"
                                type="email"
                                className="pl-10 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Email Address (Optional)"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <MapPin className="absolute top-3 left-3 text-gray-400" size={18} />
                            <input
                                name="pincode"
                                type="text"
                                className="pl-10 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <input
                                name="address"
                                type="text"
                                className="block w-full rounded-lg border-gray-300 border py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Full Address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <input
                                name="city"
                                type="text"
                                className="block w-full rounded-lg border-gray-300 border py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <input
                                name="state"
                                type="text"
                                className="block w-full rounded-lg border-gray-300 border py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                        >
                            {loading ? <Loader className="animate-spin" /> : 'Register Account'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
