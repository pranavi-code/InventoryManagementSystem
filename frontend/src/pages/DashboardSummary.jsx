import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBox, FaTags, FaTruck, FaShoppingCart, FaUsers, FaExclamationTriangle, FaChartLine, FaDollarSign } from 'react-icons/fa';

const DashboardSummary = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        suppliers: 0,
        orders: 0,
        users: 0,
        lowStock: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('pos-token');
                const [prodRes, catRes, supRes, ordRes, userRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/product', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/category', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/supplier', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/order', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/user', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const products = prodRes.data.products || [];
                const orders = ordRes.data.orders || [];
                
                // Calculate total revenue
                const totalRevenue = orders.reduce((sum, order) => {
                    return sum + (order.totalAmount || 0);
                }, 0);

                // Calculate pending orders
                const pendingOrders = orders.filter(order => order.status === 'Pending').length;

                setStats({
                    products: products.length,
                    categories: catRes.data.categories.length,
                    suppliers: supRes.data.suppliers.length,
                    orders: orders.length,
                    users: userRes.data.users.length,
                    lowStock: products.filter(p => p.quantity < 10).length,
                    totalRevenue: totalRevenue,
                    pendingOrders: pendingOrders
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Products',
            value: stats.products,
            icon: FaBox,
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
            textColor: 'text-blue-600'
        },
        {
            title: 'Categories',
            value: stats.categories,
            icon: FaTags,
            color: 'bg-gradient-to-r from-green-500 to-green-600',
            textColor: 'text-green-600'
        },
        {
            title: 'Suppliers',
            value: stats.suppliers,
            icon: FaTruck,
            color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Total Orders',
            value: stats.orders,
            icon: FaShoppingCart,
            color: 'bg-gradient-to-r from-purple-500 to-purple-600',
            textColor: 'text-purple-600'
        },
        {
            title: 'Active Users',
            value: stats.users,
            icon: FaUsers,
            color: 'bg-gradient-to-r from-pink-500 to-pink-600',
            textColor: 'text-pink-600'
        },
        {
            title: 'Low Stock Items',
            value: stats.lowStock,
            icon: FaExclamationTriangle,
            color: 'bg-gradient-to-r from-red-500 to-red-600',
            textColor: 'text-red-600'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: FaDollarSign,
            color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
            textColor: 'text-emerald-600'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: FaChartLine,
            color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
            textColor: 'text-indigo-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
                <div className="mb-8 animate-slide-down">
                    <div className="backdrop-blur-xl bg-white/30 p-8 rounded-3xl border border-white/20 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Admin Dashboard ⚡
                                </h1>
                                <p className="text-gray-600 mt-3 text-lg">Welcome back! Here's an overview of your inventory system in real-time.</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <FaChartLine className="text-2xl text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="backdrop-blur-xl bg-white/30 p-8 rounded-3xl border border-white/20 shadow-2xl">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                <div className="text-xl font-semibold text-gray-700">Loading dashboard...</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card, index) => (
                            <div 
                                key={index} 
                                className="group backdrop-blur-xl bg-white/30 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-4 rounded-2xl ${card.color} shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}>
                                        <card.icon className="text-white text-2xl" />
                                    </div>
                                    <div className={`text-3xl font-bold ${card.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                        {card.value}
                                    </div>
                                </div>
                                <h3 className="text-gray-700 font-bold text-lg group-hover:text-gray-800 transition-colors">{card.title}</h3>
                                <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
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
                
                .animate-blob {
                    animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                
                .animate-slide-down {
                    animation: slide-down 0.6s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default DashboardSummary;