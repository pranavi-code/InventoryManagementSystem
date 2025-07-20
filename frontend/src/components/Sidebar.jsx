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
    FaCog
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
        { path: '/admin-dashboard/categories', icon: FaTable, label: 'Categories' },
        { path: '/admin-dashboard/products', icon: FaBox, label: 'Products' },
        { path: '/admin-dashboard/suppliers', icon: FaTruck, label: 'Suppliers' },
        { path: '/admin-dashboard/orders', icon: FaShoppingCart, label: 'Orders' },
        { path: '/admin-dashboard/users', icon: FaUsers, label: 'Users' },
        { path: '/admin-dashboard/inventory', icon: FaClipboardList, label: 'Inventory' },
        { path: '/admin-dashboard/notifications', icon: FaBell, label: 'Notifications' },
        { path: '/admin-dashboard/profile', icon: FaUser, label: 'Profile' },
    ];

    return (
        <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 min-h-screen flex flex-col shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-blue-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <FaUser className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">{user?.name}</h2>
                        <p className="text-blue-400 text-sm">Administrator</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                                        isActive
                                            ? 'bg-blue-700 text-white shadow-lg'
                                            : 'text-blue-300 hover:bg-blue-700 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="text-lg" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-blue-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-blue-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;