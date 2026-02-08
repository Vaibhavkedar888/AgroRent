import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { motion } from 'framer-motion';
import { Upload, Loader, Save, ArrowLeft, MapPin } from 'lucide-react';
import EquipmentService from '../../api/equipmentService';

const EditEquipmentPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const isAdmin = user?.role === 'ADMIN';

    const [formData, setFormData] = useState({
        name: '',
        category: 'Tractor',
        description: '',
        pricePerHour: '',
        pricePerDay: '',
        pricePerWeek: '',
        location: '',
        latitude: '',
        longitude: '',
        availabilityFrom: '',
        availabilityTo: '',
        image: null
    });

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const data = await EquipmentService.getEquipmentById(id);
                setFormData({
                    name: data.name,
                    category: data.category,
                    description: data.description,
                    pricePerHour: data.pricePerHour || '',
                    pricePerDay: data.pricePerDay,
                    pricePerWeek: data.pricePerWeek || '',
                    location: data.location,
                    latitude: data.coordinates ? data.coordinates[1] : '',
                    longitude: data.coordinates ? data.coordinates[0] : '',
                    availabilityFrom: data.availabilityFrom,
                    availabilityTo: data.availabilityTo,
                    image: null
                });
                if (data.imageUrl) {
                    setImagePreview(`http://localhost:8080${data.imageUrl}`);
                }
            } catch (err) {
                setError('Failed to fetch equipment details');
            } finally {
                setFetching(false);
            }
        };
        fetchEquipment();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
            },
            () => alert("Unable to retrieve location")
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await EquipmentService.updateEquipment(id, formData, isAdmin);
            navigate(isAdmin ? '/admin/dashboard' : '/owner/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update equipment');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to={isAdmin ? "/admin/dashboard" : "/owner/dashboard"} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition">
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Equipment</h1>
                        <p className="text-sm text-gray-500 mt-1">Update your machinery details and pricing</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">{error}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Equipment Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500 transition"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500 transition bg-white"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="Tractor">Tractor</option>
                                    <option value="Harvester">Harvester</option>
                                    <option value="Planter">Planter</option>
                                    <option value="Tillage">Tillage</option>
                                    <option value="Irrigation">Irrigation</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="col-span-2 border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Tiers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Per Hour (₹)</label>
                                        <input
                                            name="pricePerHour"
                                            type="number"
                                            className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                            value={formData.pricePerHour}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Per Day (₹) *</label>
                                        <input
                                            name="pricePerDay"
                                            type="number"
                                            required
                                            className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                            value={formData.pricePerDay}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Per Week (₹)</label>
                                        <input
                                            name="pricePerWeek"
                                            type="number"
                                            className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                            value={formData.pricePerWeek}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    required
                                    className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2 border-t border-gray-100 pt-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Available From</label>
                                    <input
                                        name="availabilityFrom"
                                        type="date"
                                        required
                                        className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                        value={formData.availabilityFrom}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Available To</label>
                                    <input
                                        name="availabilityTo"
                                        type="date"
                                        required
                                        className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                        value={formData.availabilityTo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Location</h3>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="text-xs font-bold bg-primary-50 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100 flex items-center gap-2"
                                    >
                                        <MapPin size={14} /> Update to Current Location
                                    </button>
                                </div>
                                <input
                                    name="location"
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Equipment Photo</label>
                                <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-gray-200 border-dashed rounded-3xl hover:border-primary-500 transition cursor-pointer relative bg-gray-50/50 group">
                                    <div className="space-y-4 text-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="mx-auto h-48 object-cover rounded-2xl shadow-md" alt="Preview" />
                                        ) : (
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-600 font-bold">
                                            <span className="text-primary-600">Click to change photo</span>
                                        </div>
                                        <input name="file" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/owner/dashboard')}
                                className="px-8 py-4 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition flex items-center gap-2 min-w-[200px] justify-center"
                            >
                                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                Update Listing
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditEquipmentPage;
