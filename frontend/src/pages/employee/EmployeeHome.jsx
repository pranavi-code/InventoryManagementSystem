import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { getStatusIcon, getStatusColor } from '../../utils/orderUtils';
import { 
    FaShoppingCart, 
    FaClipboardCheck, 
    FaClock, 
    FaTruck,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaBox,
    FaSpinner,
    FaArrowUp
} from 'react-icons/fa';
import { Link } from 'react-router';

const EmployeeHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Fetch every 30 seconds

        return () => clearInterval(interval);
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            if (!user || !(user.id || user._id)) {
                console.log('No user found, skipping data fetch');
                return;
            }

            console.log('Fetching dashboard data for user:', user);

            // Fetch data in parallel for better performance
            const [ordersRes, statsRes] = await Promise.all([
                API.get('/order'),
                API.get('/order/stats')
            ]);

            const userOrders = ordersRes.data.orders || [];
            const statsData = statsRes.data.stats || [];
            
            console.log('User orders received:', userOrders.length);
            console.log('Stats data received:', statsData);

            // Calculate stats directly from orders for more reliable data
            const processedStats = {
                total: userOrders.length,
                pending: userOrders.filter(order => order.status === 'Pending').length,
                approved: userOrders.filter(order => order.status === 'Approved').length,
                processing: userOrders.filter(order => order.status === 'Processing').length,
                shipped: userOrders.filter(order => order.status === 'Shipped').length,
                delivered: userOrders.filter(order => order.status === 'Delivered').length,
                cancelled: userOrders.filter(order => order.status === 'Cancelled').length,
                rejected: userOrders.filter(order => order.status === 'Rejected').length
            };

            console.log('Calculated stats from orders:', processedStats);

            setStats(processedStats);
            setRecentOrders(userOrders.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set default values if API fails
            setStats({
                total: 0,
                pending: 0,
                approved: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0,
                rejected: 0
            });
            setRecentOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusCount = (status) => {
        return stats[status.toLowerCase()] || 0;
    };

    const statsCards = [
        {
            title: 'Total Orders',
            value: stats.total || 0,
            icon: FaShoppingCart,
            gradient: 'from-purple-500 via-violet-500 to-indigo-600',
            bgGradient: 'from-purple-500/10 via-violet-500/10 to-indigo-500/10',
            iconBg: 'bg-gradient-to-r from-purple-500 to-indigo-600',
            textColor: 'text-purple-600'
        },
        {
            title: 'Pending Orders',
            value: getStatusCount('Pending'),
            icon: FaClock,
            gradient: 'from-amber-500 via-orange-500 to-red-500',
            bgGradient: 'from-amber-500/10 via-orange-500/10 to-red-500/10',
            iconBg: 'bg-gradient-to-r from-amber-500 to-red-500',
            textColor: 'text-amber-600'
        },
        {
            title: 'Approved Orders',
            value: getStatusCount('Approved'),
            icon: FaCheckCircle,
            gradient: 'from-emerald-500 via-green-500 to-teal-600',
            bgGradient: 'from-emerald-500/10 via-green-500/10 to-teal-500/10',
            iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
            textColor: 'text-emerald-600'
        },
        {
            title: 'Delivered Orders',
            value: getStatusCount('Delivered'),
            icon: FaTruck,
            gradient: 'from-blue-500 via-cyan-500 to-teal-600',
            bgGradient: 'from-blue-500/10 via-cyan-500/10 to-teal-500/10',
            iconBg: 'bg-gradient-to-r from-blue-500 to-teal-600',
            textColor: 'text-blue-600'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="backdrop-blur-xl bg-white/30 p-8 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex flex-col items-center space-y-4">
                        <FaSpinner className="text-4xl text-indigo-600 animate-spin" />
                        <div className="text-xl font-semibold text-gray-700">Loading your dashboard...</div>
                        <div className="text-sm text-gray-500">Preparing your personalized data</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="mb-8 animate-slide-down">
                    <div className="backdrop-blur-xl bg-white/30 p-8 rounded-3xl border border-white/20 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Welcome back, {user?.name}! ✨
                                </h1>
                                <p className="text-gray-600 mt-3 text-lg">Here's an overview of your orders and activities</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <FaBox className="text-2xl text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((card, index) => (
                        <div 
                            key={card.title}
                            className={`group backdrop-blur-xl bg-gradient-to-br ${card.bgGradient} border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                                        {card.title}
                                    </p>
                                    <p className={`text-4xl font-bold ${card.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                        {card.value}
                                    </p>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <FaArrowUp className="text-green-500" />
                                        <span>Live data</span>
                                    </div>
                                </div>
                                <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300`}>
                                    <card.icon className="text-white text-2xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Link 
                        to="/employee-dashboard/place-order"
                        className="group backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/20 text-gray-800 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                        style={{ animationDelay: '400ms' }}
                    >
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                                <FaShoppingCart className="text-2xl text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Place New Order</h3>
                                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Order products from inventory</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/employee-dashboard/my-orders"
                        className="group backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-white/20 text-gray-800 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                        style={{ animationDelay: '500ms' }}
                    >
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                                <FaClipboardCheck className="text-2xl text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">View My Orders</h3>
                                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Track your order status</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/employee-dashboard/products"
                        className="group backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-white/20 text-gray-800 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                        style={{ animationDelay: '600ms' }}
                    >
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                                <FaBox className="text-2xl text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Browse Products</h3>
                                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">View available inventory</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-3xl shadow-2xl animate-slide-up" style={{ animationDelay: '700ms' }}>
                    <div className="p-8 border-b border-white/20">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Recent Orders
                            </h2>
                            <Link 
                                to="/employee-dashboard/my-orders"
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                    <div className="p-8">
                        {recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {recentOrders.map((order, index) => (
                                    <div 
                                        key={order._id} 
                                        className="group backdrop-blur-sm bg-white/40 border border-white/30 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
                                        style={{ animationDelay: `${800 + index * 100}ms` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    {getStatusIcon(order.status)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                                                        {order.product?.name}
                                                    </h4>
                                                    <p className="text-gray-600 font-medium">Quantity: {order.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getStatusColor(order.status)} group-hover:scale-105 transition-transform duration-300`}>
                                                    {order.status}
                                                </span>
                                                <p className="text-gray-600 mt-2 font-medium">
                                                    {new Date(order.orderDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 animate-slide-up" style={{ animationDelay: '800ms' }}>
                                <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <FaShoppingCart className="text-3xl text-white" />
                                </div>
                                <p className="text-xl text-gray-600 mb-4 font-semibold">No orders yet</p>
                                <Link 
                                    to="/employee-dashboard/place-order"
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    <FaShoppingCart className="mr-3" />
                                    Place your first order
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-blob {
                    animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-slide-down {
                    animation: slide-down 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default EmployeeHome;