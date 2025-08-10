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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's an overview of your inventory system.</p>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">Loading dashboard...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${card.color}`}>
                                    <card.icon className="text-white text-xl" />
                                </div>
                                <div className={`text-2xl font-bold ${card.textColor}`}>
                                    {card.value}
                                </div>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">{card.title}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardSummary;