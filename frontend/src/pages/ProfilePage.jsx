import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Phone, Save, Loader } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../context/useLanguage';
import api from '../api/axios';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        try {
            const response = await api.put('/api/user/profile', formData);
            setUser(response.data);
            setMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Update failed', error);
            setMessage('Failed to update profile.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-primary-600 p-8 text-white relative">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <User size={48} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{user.fullName}</h1>
                                <p className="text-primary-100 flex items-center gap-1 mt-1">
                                    <Phone size={14} /> {user.phoneNumber}
                                </p>
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mt-2 uppercase tracking-widest border border-white/20">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        {/* Abstract background shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {message && (
                            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {message}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                    <User size={14} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-gray-100 border-2 p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                    <Mail size={14} /> Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full rounded-xl border-gray-100 border-2 p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <MapPin size={14} /> Address
                            </label>
                            <textarea
                                required
                                rows="3"
                                className="w-full rounded-xl border-gray-100 border-2 p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">City</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-gray-100 border-2 p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">State</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-gray-100 border-2 p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pincode</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-gray-100 border-2 p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 active:scale-95 transition-all"
                            >
                                {submitting ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Update Profile</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
