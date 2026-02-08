import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, ArrowLeft, Loader, CheckCircle, AlertCircle, Tractor, Star, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import EquipmentService from '../api/equipmentService';
import ReviewService from '../api/reviewService';
import { useAuth } from '../context/useAuth';

const EquipmentDetailsPage = () => {
    const { t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [equipment, setEquipment] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [rentalType, setRentalType] = useState('DAILY'); // HOURLY, DAILY, WEEKLY
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        notes: '',
        latitude: '',
        longitude: ''
    });

    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [eqData, revData] = await Promise.all([
                    EquipmentService.getEquipmentById(id),
                    ReviewService.getEquipmentReviews(id)
                ]);
                setEquipment(eqData);
                setReviews(revData);
            } catch (err) {
                setError('Failed to load details.');
            } finally {
                setLoading(false);
                setReviewsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setBookingData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                alert("Location captured for booking!");
            },
            (error) => alert("Unable to retrieve location.")
        );
    };

    const calculateTotal = () => {
        if (!equipment) return 0;

        if (rentalType === 'HOURLY') {
            if (!bookingData.startTime || !bookingData.endTime) return 0;
            const start = new Date(`${bookingData.startDate || '2000-01-01'}T${bookingData.startTime}`);
            const end = new Date(`${bookingData.startDate || '2000-01-01'}T${bookingData.endTime}`);
            const diffHours = (end - start) / (1000 * 60 * 60);
            return diffHours > 0 ? Math.ceil(diffHours) * (equipment.pricePerHour || equipment.pricePerDay / 8) : 0;
        }

        if (!bookingData.startDate || !bookingData.endDate) return 0;
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (rentalType === 'WEEKLY') {
            const weeks = Math.ceil(diffDays / 7);
            return weeks > 0 ? weeks * (equipment.pricePerWeek || equipment.pricePerDay * 6) : 0;
        }

        return diffDays > 0 ? diffDays * equipment.pricePerDay : 0;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        setError('');

        try {
            await EquipmentService.bookEquipment({
                equipmentId: id,
                rentalType,
                farmerCoordinates: bookingData.latitude ? [bookingData.longitude, bookingData.latitude] : null,
                ...bookingData
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-primary-600" /></div>;
    if (!equipment) return <div className="min-h-screen flex items-center justify-center">Equipment not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/equipment" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition">
                    <ArrowLeft size={20} className="mr-2" /> {t('backToBrowse')}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left side */}
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-[400px] bg-gray-100 relative">
                                {equipment.imageUrl ? (
                                    <img src={`http://localhost:8080${equipment.imageUrl}`} alt={equipment.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Tractor size={100} /></div>
                                )}
                            </div>
                        </motion.div>

                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{equipment.name}</h1>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <MapPin size={16} /> {equipment.location}
                                </div>
                                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <CheckCircle size={16} /> Verified Quality
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <PriceCard label="Per Hour" amount={equipment.pricePerHour || equipment.pricePerDay / 8} active={rentalType === 'HOURLY'} />
                                <PriceCard label="Per Day" amount={equipment.pricePerDay} active={rentalType === 'DAILY'} />
                                <PriceCard label="Per Week" amount={equipment.pricePerWeek || equipment.pricePerDay * 6} active={rentalType === 'WEEKLY'} />
                            </div>

                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Equipment Specification</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">{equipment.description}</p>
                        </div>
                    </div>

                    {/* Right side - Booking */}
                    <div className="h-fit lg:sticky lg:top-24">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Booking</h2>

                            {success ? (
                                <div className="text-center py-10">
                                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-green-600" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                                    <p className="text-gray-500 mb-8">The owner will be notified of your request.</p>
                                    <Link to="/farmer/dashboard" className="block w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-200">View My Bookings</Link>
                                </div>
                            ) : (
                                <form onSubmit={handleBooking} className="space-y-6">
                                    {!user ? (
                                        <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl text-sm flex gap-3">
                                            <AlertCircle size={20} className="shrink-0" />
                                            <span>Please <Link to="/login" className="underline font-bold">Log in as a Farmer</Link> to book.</span>
                                        </div>
                                    ) : null}

                                    {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium">{error}</div>}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Rental Duration Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['HOURLY', 'DAILY', 'WEEKLY'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setRentalType(type)}
                                                    className={`py-3 rounded-xl text-sm font-bold transition-all border ${rentalType === type ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                                                >
                                                    {type === 'HOURLY' ? 'Hourly' : type === 'DAILY' ? 'Daily' : 'Weekly'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full rounded-xl border-gray-100 border p-4 focus:ring-2 focus:ring-primary-500 transition"
                                                value={bookingData.startDate}
                                                onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                            />
                                        </div>
                                        {rentalType === 'HOURLY' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Time</label>
                                                    <input type="time" required className="w-full rounded-xl border-gray-100 border p-4 bg-gray-50" value={bookingData.startTime} onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Time</label>
                                                    <input type="time" required className="w-full rounded-xl border-gray-100 border p-4 bg-gray-50" value={bookingData.endTime} onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    className="w-full rounded-xl border-gray-100 border p-4 bg-gray-50"
                                                    value={bookingData.endDate}
                                                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all border ${bookingData.latitude ? 'bg-green-50 text-green-700 border-green-100' : 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100'}`}
                                        >
                                            <MapPin size={20} />
                                            {bookingData.latitude ? 'Location Captured!' : 'Capture My Current Location'}
                                        </button>
                                        <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest font-bold">Required to find nearest service</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Estimate</span>
                                            <span className="text-3xl font-black text-gray-900">₹{calculateTotal()}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={bookingLoading || !user || user.role !== 'FARMER'}
                                        className="w-full py-5 rounded-2xl bg-primary-600 text-white text-lg font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {bookingLoading ? <Loader className="animate-spin" /> : 'Confirm Booking Request'}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriceCard = ({ label, amount, active }) => (
    <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-100' : 'bg-white border-gray-100'}`}>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
        <p className={`text-lg font-black ${active ? 'text-primary-700' : 'text-gray-900'}`}>₹{Math.round(amount)}</p>
    </div>
);

export default EquipmentDetailsPage;
