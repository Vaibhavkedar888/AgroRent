import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Tractor, DollarSign, Calendar, Check, X, Shield, ShieldOff, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, bookings, equipment, recent
    const [allEquipment, setAllEquipment] = useState([]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const response = await api.get('/api/admin/dashboard');
            setStats(response.data);

            const usersResponse = await api.get('/api/admin/users');
            setUsers(usersResponse.data);

            const bookingsResponse = await api.get('/api/admin/bookings');
            setAllBookings(bookingsResponse.data);

            const equipResponse = await api.get('/api/admin/equipment');
            setAllEquipment(equipResponse.data);
        } catch (err) {
            setError('Failed to fetch admin data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveEquipment = async (id) => {
        try {
            await api.post(`/api/admin/equipment/${id}/approve`);
            fetchAdminData();
        } catch (err) {
            alert('Failed to approve equipment');
        }
    };

    const handleRejectEquipment = async (id) => {
        if (!window.confirm('Are you sure you want to reject and delete this equipment listing?')) return;
        try {
            await api.delete(`/api/admin/equipment/${id}`);
            fetchAdminData();
        } catch (err) {
            alert('Failed to delete equipment');
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await api.post(`/api/admin/users/${userId}/block`);
            fetchAdminData();
        } catch (err) {
            alert('Failed to block user');
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            await api.post(`/api/admin/users/${userId}/unblock`);
            fetchAdminData();
        } catch (err) {
            alert('Failed to unblock user');
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
        try {
            await api.post(`/api/admin/bookings/${bookingId}/cancel`);
            fetchAdminData();
        } catch (err) {
            alert('Failed to cancel booking');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>
                        <p className="text-gray-600 mt-1">Platform overview and management</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={<Users className="text-blue-600" />} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
                    <StatCard icon={<Tractor className="text-green-600" />} label="Equipment" value={stats?.totalEquipment || 0} color="green" />
                    <StatCard icon={<Calendar className="text-orange-600" />} label="Total Bookings" value={stats?.totalBookings || 0} color="orange" />
                    <StatCard icon={<DollarSign className="text-purple-600" />} label="Total Revenue" value={`₹${stats?.totalRevenue || 0}`} color="purple" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100">
                        <nav className="flex">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Approvals" />
                            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" />
                            <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} label="All Bookings" />
                            <TabButton active={activeTab === 'equipment'} onClick={() => setActiveTab('equipment')} label="Equipment" />
                            <TabButton active={activeTab === 'recent'} onClick={() => setActiveTab('recent')} label="Recent" />
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <AlertCircle size={20} className="text-orange-500" />
                                    Equipment Awaiting Approval
                                </h2>
                                {stats?.pendingEquipment?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {stats.pendingEquipment.map((eq) => (
                                            <div key={eq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center border border-gray-200 overflow-hidden">
                                                        {eq.imageUrl ? <img src={`http://localhost:8080${eq.imageUrl}`} alt="" className="h-full w-full object-cover" /> : <Tractor className="text-gray-400" size={24} />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{eq.name}</h3>
                                                        <p className="text-sm text-gray-500">{eq.category} • Listed by {eq.owner?.fullName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveEquipment(eq.id)} title="Approve" className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-sm"><Check size={18} /></button>
                                                    <button onClick={() => handleRejectEquipment(eq.id)} title="Delete" className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"><X size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Check className="mx-auto mb-2 text-green-500" size={32} />
                                        <p>All equipment listings have been processed.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-6">Regulated Users</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {users.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">{u.fullName}</div>
                                                                <div className="text-sm text-gray-500">{u.phoneNumber}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {u.isBlocked ? (
                                                            <span className="text-red-600 flex items-center gap-1 text-xs font-bold"><ShieldOff size={14} /> BLOCKED</span>
                                                        ) : (
                                                            <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><Shield size={14} /> ACTIVE</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {u.role !== 'ADMIN' && (
                                                            u.isBlocked ? (
                                                                <button onClick={() => handleUnblockUser(u.id)} className="text-green-600 hover:text-green-900 font-bold uppercase text-xs">Unblock</button>
                                                            ) : (
                                                                <button onClick={() => handleBlockUser(u.id)} className="text-red-600 hover:text-red-900 font-bold uppercase text-xs">Block</button>
                                                            )
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-6">Platform Bookings</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipment</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Farmer</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {allBookings.map((b) => (
                                                <tr key={b.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.equipment?.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.farmer?.fullName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : b.status === 'PENDING' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                                                            <button onClick={() => handleCancelBooking(b.id)} className="text-red-600 hover:text-red-900 font-bold uppercase text-xs">Force Cancel</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'equipment' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-6">Manage All Equipment</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allEquipment.map((eq) => (
                                        <div key={eq.id} className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4 bg-gray-50/30 hover:bg-white hover:shadow-md transition group">
                                            <div className="h-14 w-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                                                {eq.imageUrl ? <img src={`http://localhost:8080${eq.imageUrl}`} className="object-cover h-full w-full" alt="" /> : <Tractor className="text-gray-400" size={20} />}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-gray-900 leading-tight">{eq.name}</h4>
                                                <p className="text-xs text-gray-500">Owner: {eq.owner?.fullName}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${eq.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {eq.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/owner/edit-equipment/${eq.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition"
                                                >
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleRejectEquipment(eq.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'recent' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Recent Platform Activity</h2>
                                <div className="divide-y divide-gray-100">
                                    {stats?.recentBookings?.map((booking) => (
                                        <div key={booking.id} className="py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booking.farmer?.fullName} booked {booking.equipment?.name}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ₹{booking.totalAmount} • {booking.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
            <div className={`p-4 bg-${color}-50 rounded-xl`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${active ? 'border-primary-600 text-primary-600 bg-primary-50/10' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
    >
        {label}
    </button>
);

export default AdminDashboard;
