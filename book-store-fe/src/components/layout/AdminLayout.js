import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminRoutes } from '../../constants/permissions';
import Icon from '../common/Icon';
import logo from '../../assets/image.png';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const adminRoutes = getAdminRoutes(user?.role, user?.adminInfo?.department);

    const handleLogout = async () => {
        await logout();
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm w-full fixed top-0 left-0 z-40 h-16 flex items-center">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">

                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="px-2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <Icon name="mdi:menu" className="h-6 w-6" />
                        </button>

                        <Link to="/admin" className="flex items-center no-underline">
                            <img src={logo} alt="Logo" className="h-8 w-8 object-contain mr-2" />
                            <span className="text-xl font-bold text-gray-800">Admin Dashboard</span>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <span className="text-gray-700 mr-4">
                            {user?.role === 'superadmin' ? 'Super Admin' : `Admin ${user?.adminInfo?.department || ''}`}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-gray-700 hover:text-red-600 transition-colors"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside
                    className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg transform transition-transform duration-200 ease-in-out`}
                >
                    <div className="h-full pt-4 pb-4 overflow-y-auto">
                        <nav className="px-2 space-y-1">
                            {adminRoutes.map((route) => (
                                <Link
                                    key={route.path}
                                    to={route.path}
                                    className={`${location.pathname === route.path
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } group flex items-center px-2 py-2 text-base font-medium rounded-md no-underline`}
                                >
                                    {route.icon && (
                                        <Icon name={route.icon} className="w-5 h-5 mr-3" />
                                    )}
                                    <span className="truncate">{route.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className={`flex-1 transition-all duration-200 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-6`}
                >
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 