import { motion } from 'framer-motion';
import { Tractor, Sprout, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';
import { useRef } from 'react';

const LandingPage = () => {
    const { t } = useLanguage();
    const videoRef = useRef(null);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
                <img
                    src="bd.jpg"
                    alt="Farming Background"
                    className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-[0.65]"
                />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black text-white tracking-tight sm:text-7xl drop-shadow-2xl"
                        >
                            Modern Farming <span className="text-primary-400">Equipment Rental</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 max-w-3xl mx-auto text-xl text-gray-100 font-medium leading-relaxed drop-shadow-lg"
                        >
                            Connect with equipment owners, rent high-quality machinery, and maximize your yield. 
                            <span className="block mt-2 text-primary-300 font-bold">The smart choice for modern Indian farmers.</span>
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-12 flex justify-center gap-6"
                        >
                            <Link to="/login" className="px-10 py-4 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-700 transition transform hover:scale-105 shadow-[0_10px_20px_rgba(20,122,91,0.3)] flex items-center gap-3">
                                Get Started <ArrowRight size={22} />
                            </Link>
                            <Link to="/about" className="px-10 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-bold border border-white/30 hover:bg-white/20 transition transform hover:scale-105 shadow-xl">
                                Learn More
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={<Tractor size={40} className="text-primary-600" />}
                            title={t('equipment')}
                            description="From tractors to harvesters, find everything you need for mechanised farming."
                        />
                        <FeatureCard
                            icon={<Users size={40} className="text-primary-600" />}
                            title="Direct Farmer Connection"
                            description="Rent directly from equipment owners. No middlemen, transparent pricing."
                        />
                        <FeatureCard
                            icon={<Sprout size={40} className="text-primary-600" />}
                            title={t('schemes')}
                            description="Access modern technology and government support without heavy investment."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition duration-300 border border-gray-100"
    >
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
);

export default LandingPage;
