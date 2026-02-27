import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, ExternalLink, Search, Filter } from 'lucide-react';
import api from '../api/axios';

const SchemesPage = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchSchemes();
    }, [selectedCategory]);

    const fetchSchemes = async () => {
        try {
            const response = await api.get('/api/public/schemes', {
                params: { category: selectedCategory }
            });
            setSchemes(response.data);
        } catch (error) {
            console.error("Failed to fetch schemes", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSchemes = schemes.filter(scheme =>
        scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-gray-900"
                    >
                        Government <span className="text-primary-600">Schemes</span>
                    </motion.h1>
                    <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                        Discover the latest government initiatives designed to support farmers and promote agricultural growth.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute top-3 left-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search schemes..."
                            className="pl-10 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-1/4">
                        <Filter className="absolute top-3 left-3 text-gray-400" size={20} />
                        <select
                            className="pl-10 block w-full rounded-lg border-gray-300 border py-2.5 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="Financial Support">Financial Support</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Mechanization">Mechanization</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSchemes.map((scheme) => (
                            <motion.div
                                key={scheme.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col"
                            >
                                <div className="p-8 flex-grow">
                                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                                        <Sprout className="text-primary-600" size={24} />
                                    </div>
                                    <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                        {scheme.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{scheme.title}</h3>
                                    <p className="text-gray-600 mb-6 text-sm line-clamp-3">{scheme.description}</p>

                                    <div className="space-y-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Benefits</h4>
                                            <p className="text-sm text-gray-700">{scheme.benefits}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Eligibility</h4>
                                            <p className="text-sm text-gray-700">{scheme.eligibility}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                                    <a
                                        href={scheme.applyLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition group"
                                    >
                                        Official Portal <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredSchemes.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No schemes found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchemesPage;
