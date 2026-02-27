import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { motion } from 'framer-motion';
import { Plus, Tractor, DollarSign, List, Check, X, Clock, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ChatModal from '../../components/ChatModal';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // pending, active, history, equipment
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/api/owner/dashboard');
            setStats(response.data);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (bookingId, action) => {
        try {
            await api.post(`/api/owner/bookings/${bookingId}/${action}`);
            fetchDashboardData(); // Refresh data
        } catch (err) {
            alert(`Failed to ${action} booking`);
        }
    };

    const handleDeleteEquipment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this equipment?')) return;
        try {
            await api.delete(`/api/owner/equipment/${id}`);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to delete equipment');
        }
    };

    const openChat = (booking) => {
        setSelectedBooking(booking);
        setIsChatOpen(true);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

    const bookings = stats?.bookings || [];
    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const activeBookings = bookings.filter(b => b.status === 'CONFIRMED');
    const historyBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
    const myEquipment = stats?.equipment || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Owner Command Center</h1>
                        <p className="text-gray-600 mt-1">Manage your fleet and earnings</p>
                    </div>
                    <Link to="/owner/add-equipment" className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition shadow-md flex items-center gap-2">
                        <Plus size={20} /> Add New Equipment
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard icon={<DollarSign className="text-green-600" />} label="Total Earnings" value={`₹${stats?.totalEarnings || 0}`} color="green" />
                    <StatCard icon={<Tractor className="text-blue-600" />} label="Fleet Size" value={stats?.equipmentCount || 0} color="blue" />
                    <StatCard icon={<Clock className="text-orange-600" />} label="Pending Actions" value={pendingBookings.length} color="orange" />
                </div>

                {/* Main Content Area with Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100">
                        <nav className="flex">
                            <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label={`Requests (${pendingBookings.length})`} />
                            <TabButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} label={`Active (${activeBookings.length})`} />
                            <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" />
                            <TabButton active={activeTab === 'equipment'} onClick={() => setActiveTab('equipment')} label="My Listings" />
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'pending' && (
                            <div className="divide-y divide-gray-100">
                                {pendingBookings.length > 0 ? pendingBookings.map(booking => (
                                    <BookingRow
                                        key={booking.id}
                                        booking={booking}
                                        onChat={() => openChat(booking)}
                                        actions={[
                                            { label: 'Approve', icon: <Check size={18} />, color: 'green', onClick: () => handleAction(booking.id, 'approve') },
                                            { label: 'Reject', icon: <X size={18} />, color: 'red', onClick: () => handleAction(booking.id, 'reject') }
                                        ]}
                                    />
                                )) : <EmptyState message="No pending requests" />}
                            </div>
                        )}

                        {activeTab === 'active' && (
                            <div className="divide-y divide-gray-100">
                                {activeBookings.length > 0 ? activeBookings.map(booking => (
                                    <BookingRow
                                        key={booking.id}
                                        booking={booking}
                                        showContact
                                        onChat={() => openChat(booking)}
                                        actions={[
                                            { label: 'Mark Completed', icon: <Check size={18} />, color: 'blue', onClick: () => handleAction(booking.id, 'complete') },
                                            { label: 'Cancel', icon: <X size={18} />, color: 'gray', onClick: () => handleAction(booking.id, 'cancel') }
                                        ]}
                                    />
                                )) : <EmptyState message="No active rentals" />}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="divide-y divide-gray-100">
                                {historyBookings.length > 0 ? historyBookings.map(booking => (
                                    <BookingRow key={booking.id} booking={booking} onChat={() => openChat(booking)} />
                                )) : <EmptyState message="No past bookings" />}
                            </div>
                        )}

                        {activeTab === 'equipment' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myEquipment.length > 0 ? myEquipment.map(eq => (
                                    <div key={eq.id} className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-primary-100 hover:shadow-md transition group">
                                        <div className="h-16 w-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                                            {eq.imageUrl ? <img src={`http://localhost:8080${eq.imageUrl}`} className="object-cover h-full w-full" alt="" /> : <Tractor className="text-gray-400" />}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-gray-900 leading-tight">{eq.name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">{eq.category} • ₹{eq.pricePerDay}/day</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/owner/edit-equipment/${eq.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit Listing"
                                                >
                                                    <Pencil size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteEquipment(eq.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Listing"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${eq.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {eq.isApproved ? 'LIVE' : 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                )) : <EmptyState message="You haven't listed any equipment yet" />}
                            </div>
                        )}
                    </div>
                </div>

                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    booking={selectedBooking}
                />
            </motion.div>
        </div>
    );
};

const BookingRow = ({ booking, actions = [], showContact = false, onChat }) => (
    <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Tractor className="text-primary-600" size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{booking.equipment?.name || 'Equipment'}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {booking.rentalType === 'HOURLY' ?
                            `${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()} (${booking.totalDuration} hrs)` :
                            `${booking.startDate} to ${booking.endDate} (${booking.totalDuration} ${booking.rentalType === 'WEEKLY' ? 'weeks' : 'days'})`
                        }
                    </span>
                    <span className="font-bold text-primary-700">₹{booking.totalAmount}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{booking.rentalType}</span>
                </div>
                <div className="mt-2 text-sm">
                    <span className="text-gray-500">Farmer: </span>
                    <span className="font-semibold text-gray-800">{booking.farmer?.fullName || 'Anonymous'}</span>
                    {showContact && booking.farmer?.phoneNumber && (
                        <span className="ml-2 bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs font-bold">{booking.farmer.phoneNumber}</span>
                    )}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onChat}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition relative"
                title="Chat with Farmer"
            >
                <MessageSquare size={20} />
            </button>
            {actions.map((action, i) => (
                <button
                    key={i}
                    onClick={action.onClick}
                    title={action.label}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition
                        ${action.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                            action.color === 'red' ? 'bg-red-600 text-white hover:bg-red-700' :
                                action.color === 'blue' ? 'bg-primary-600 text-white hover:bg-primary-700' :
                                    'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {action.icon}
                    <span className="md:hidden lg:inline">{action.label}</span>
                </button>
            ))}
            {actions.length === 0 && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {booking.status}
                </span>
            )}
        </div>
    </div>
);

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
        className={`px-6 py-4 text-sm font-bold transition-all border-b-2 
            ${active ? 'border-primary-600 text-primary-600 bg-primary-50/10' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
    >
        {label}
    </button>
);

const EmptyState = ({ message }) => (
    <div className="py-20 text-center text-gray-400">
        <List size={48} className="mx-auto mb-4 opacity-20" />
        <p className="italic font-medium">{message}</p>
    </div>
);

export default OwnerDashboard;
