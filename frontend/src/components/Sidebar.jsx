import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
    FaHome,
    FaBox,
    FaUsers,
    FaShoppingCart,
    FaTruck,
    FaClipboardList,
    FaUser,
    FaSignOutAlt,
    FaBell,
    FaTable,
    FaCog,
    FaChartLine,
    FaBuilding
} from 'react-icons/fa';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin-dashboard', icon: FaHome, label: 'Dashboard', exact: true },
        { path: '/admin-dashboard/categories', icon: FaBox, label: 'Categories' },
        { path: '/admin-dashboard/products', icon: FaTable, label: 'Products' },
        { path: '/admin-dashboard/suppliers', icon: FaTruck, label: 'Suppliers' },
        { path: '/admin-dashboard/orders', icon: FaShoppingCart, label: 'Orders' },
        { path: '/admin-dashboard/users', icon: FaUsers, label: 'Employees' },
        { path: '/admin-dashboard/inventory', icon: FaClipboardList, label: 'Inventory' },
        { path: '/admin-dashboard/sales-report', icon: FaChartLine, label: 'Sales Report' },
        { path: '/admin-dashboard/notifications', icon: FaBell, label: 'Notifications' },
        { path: '/admin-dashboard/profile', icon: FaUser, label: 'Profile' },
    ];

    return (
        <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 min-h-screen flex flex-col shadow-xl">
            
            {/* Header */}
            <div className="p-6 border-b border-blue-700">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaBuilding className="text-white text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg truncate">{user?.name || 'Admin'}</h2>
                        <p className="text-sm text-blue-300">
                            Administrator
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6">
                <div className="px-4 mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                        Management
                    </h3>
                </div>
                <ul className="space-y-1 px-4">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                                        isActive
                                            ? 'bg-blue-700 text-white shadow-lg ring-2 ring-blue-600'
                                            : 'text-blue-300 hover:bg-blue-700 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="text-lg transition-transform duration-200 group-hover:scale-110" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-blue-700 space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-blue-300 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 group"
                >
                    <FaSignOutAlt className="transition-transform duration-200 group-hover:translate-x-1" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;