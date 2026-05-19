import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-primary-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Company Info */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/logo.png" alt="AgroRent Logo" className="h-10 w-auto" />
                                <h2 className="text-2xl font-black tracking-tighter text-white">
                                    AGRO<span className="text-primary-500">Rent</span>
                                </h2>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                                Empowering modern farmers with high-tech machinery at their fingertips.
                                Our platform bridges the gap between equipment owners and farmers,
                                fostering a shared economy that boosts agricultural productivity
                                across the nation.
                            </p>
                        </div>

                        {/* About Section */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-200 mb-6">About Us</h3>
                            <ul className="space-y-4 text-gray-400 text-sm">
                                <li><a href="/about" className="hover:text-primary-400 transition">Our Mission</a></li>
                                <li><a href="/about" className="hover:text-primary-400 transition">Team AgroRent</a></li>
                                <li><a href="/about" className="hover:text-primary-400 transition">Impact Stories</a></li>
                                <li><a href="/about" className="hover:text-primary-400 transition">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Contact Section */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-200 mb-6">Contact</h3>
                            <ul className="space-y-4 text-gray-400 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary-500 font-bold">A:</span>
                                    <span>Jalgaon<br /> Maharashtra - 411001</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-primary-500 font-bold">P:</span>
                                    <span>+91 98765 43210</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-primary-500 font-bold">E:</span>
                                    <a href="mailto:support@agrolease.com" className="hover:text-primary-400">contact@agrorent.com</a>
                                </li>
                            </ul>
                        </div>
                    </div>


                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
