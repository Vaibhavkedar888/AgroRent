import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Loader, Save, ArrowLeft, MapPin } from 'lucide-react';
import EquipmentService from '../../api/equipmentService';
import { Link } from 'react-router-dom';

const AddEquipmentPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

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
                alert("GPS Coordinates captured!");
            },
            (error) => {
                alert("Unable to retrieve your location. Please check browser permissions.");
                console.error(error);
            }
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
            await EquipmentService.addEquipment(formData);
            navigate('/owner/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add equipment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/owner/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition">
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                        <h1 className="text-2xl font-bold text-gray-900">Add New Equipment</h1>
                        <p className="text-sm text-gray-500 mt-1">List your machinery with precise pricing and location</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Equipment Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                                    placeholder="e.g. John Deere 5050 D"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
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

                            {/* Pricing Section */}
                            <div className="col-span-2 border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Tiers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Per Hour (₹)</label>
                                        <input
                                            name="pricePerHour"
                                            type="number"
                                            className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                            placeholder="e.g. 250"
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
                                            placeholder="e.g. 1500"
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
                                            placeholder="e.g. 9000"
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
                                    placeholder="Include specifications like Horsepower, Model Year, Fuel type, etc."
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            {/* Location Section */}
                            <div className="col-span-2 border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Equipment Location</h3>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="text-sm bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-bold hover:bg-primary-100 transition flex items-center gap-2"
                                    >
                                        <MapPin size={16} /> Use My Current Location
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <input
                                            name="location"
                                            type="text"
                                            required
                                            className="block w-full rounded-xl border-gray-200 border p-4 focus:ring-2 focus:ring-primary-500"
                                            placeholder="Village, Taluka, District, State"
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Latitude</label>
                                        <input
                                            name="latitude"
                                            readOnly
                                            className="block w-full rounded-xl border-gray-50 border p-4 text-gray-400 bg-gray-50"
                                            placeholder="Click 'Use My Location'"
                                            value={formData.latitude}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Longitude</label>
                                        <input
                                            name="longitude"
                                            readOnly
                                            className="block w-full rounded-xl border-gray-50 border p-4 text-gray-400 bg-gray-50"
                                            placeholder="Click 'Use My Location'"
                                            value={formData.longitude}
                                        />
                                    </div>
                                </div>
                            </div>

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

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Equipment Photos</label>
                                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-200 border-dashed rounded-2xl hover:border-primary-500 transition cursor-pointer relative bg-gray-50/50 group">
                                    <div className="space-y-4 text-center">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img src={imagePreview} alt="Preview" className="mx-auto h-64 object-cover rounded-xl shadow-lg" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                                                    <span className="text-white font-bold">Change Photo</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload className="h-16 w-16 text-gray-400 mb-4" />
                                                <div className="flex text-sm text-gray-600 font-medium">
                                                    <span className="text-primary-600">Click to upload image</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                                            </div>
                                        )}
                                        <input name="file" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/owner/dashboard')}
                                className="bg-white px-8 py-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                            >
                                Discard Changes
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center items-center px-10 py-4 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 transition min-w-[200px]"
                            >
                                {loading ? <Loader className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                                Publish Listing
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AddEquipmentPage;
