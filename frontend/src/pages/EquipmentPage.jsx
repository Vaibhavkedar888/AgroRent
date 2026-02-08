import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Tractor, MapPin } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import EquipmentService from '../api/equipmentService';
import { Link } from 'react-router-dom';

const EquipmentPage = () => {
    const { t } = useLanguage();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [coords, setCoords] = useState(null);
    const [isNearest, setIsNearest] = useState(false);

    useEffect(() => {
        fetchEquipment();
    }, [selectedCategory, coords]);

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const data = await EquipmentService.getAllEquipment(
                selectedCategory,
                coords?.latitude,
                coords?.longitude
            );
            setEquipment(data);
        } catch (error) {
            console.error("Failed to fetch equipment", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setIsNearest(true);
            },
            (error) => {
                alert("Unable to retrieve your location");
                setLoading(false);
            }
        );
    };

    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        {t('browseEquipment')}
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        {t('findBestMachinery')}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute top-3 left-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="pl-10 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-1/4 flex gap-2">
                        <select
                            className="pl-4 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">{t('allCategories')}</option>
                            <option value="Tractor">Tractor</option>
                            <option value="Harvester">Harvester</option>
                            <option value="Planter">Planter</option>
                            <option value="Tillage">Tillage</option>
                        </select>
                        <button
                            onClick={handleGetLocation}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap
                                ${isNearest ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title="Show nearest first"
                        >
                            <MapPin size={18} />
                            <span className="hidden lg:inline">Nearest</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEquipment.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300 border border-gray-100 flex flex-col"
                            >
                                <div className="h-48 bg-gray-200 relative">
                                    {/* Placeholder image if none */}
                                    {item.imageUrl ? (
                                        <img src={`http://localhost:8080${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Tractor size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-sm">
                                        ₹{item.pricePerDay}/day
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mt-1 font-semibold">{item.category}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center text-sm text-gray-500 mb-6">
                                        <span className="flex items-center gap-1">📍 {item.location}</span>
                                    </div>
                                    <Link
                                        to={`/equipment/${item.id}`}
                                        className="mt-auto block w-full text-center bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition font-bold"
                                    >
                                        {t('viewDetails')}
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredEquipment.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        {t('noEquipmentFound')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentPage;
