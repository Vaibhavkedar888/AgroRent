import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../context/useLanguage';
import { Menu, X, Tractor, LogOut, User, Globe, Settings } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <Tractor className="h-8 w-8 text-primary-600" />
                            <span className="font-bold text-xl text-gray-900">AgroLease</span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        <Link to="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition">{t('home')}</Link>
                        <Link to="/about" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition">{t('about')}</Link>
                        <Link to="/equipment" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition">{t('equipment')}</Link>
                        <Link to="/schemes" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition">{t('schemes')}</Link>

                        {/* Language Switcher */}
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            <Globe size={16} className="text-gray-400" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="mr">मराठी</option>
                            </select>
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4 ml-4">
                                <Link to="/profile" className="text-gray-500 hover:text-primary-600 transition" title={t('profile')}>
                                    <Settings size={18} />
                                </Link>
                                <Link to={
                                    user.role === 'ADMIN' ? '/admin/dashboard' :
                                        user.role === 'OWNER' ? '/owner/dashboard' : '/farmer/dashboard'
                                } className="text-sm font-medium text-gray-700 flex items-center gap-1 hover:text-primary-600 transition">
                                    <User size={16} /> {user.fullName}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-500 hover:text-red-600 transition"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 ml-4">
                                <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition">{t('login')}</Link>
                                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition shadow-sm">{t('getStarted')}</Link>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden bg-white border-t border-gray-100 p-4 space-y-4">
                    <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('home')}</Link>
                    <Link to="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('about')}</Link>
                    <Link to="/equipment" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('equipment')}</Link>
                    <Link to="/schemes" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('schemes')}</Link>

                    <div className="flex items-center gap-2 px-3 py-2">
                        <Globe size={18} className="text-gray-400" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="text-sm font-medium text-gray-700"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="mr">मराठी</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                                <button onClick={handleLogout} className="text-red-600 font-medium">{t('logout')}</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link to="/login" className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700">{t('login')}</Link>
                                <Link to="/register" className="block text-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 uppercase">{t('getStarted')}</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
