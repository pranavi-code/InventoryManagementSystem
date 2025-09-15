import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { FaChartLine, FaDownload, FaFilter, FaCalendarAlt, FaDollarSign, FaBox } from 'react-icons/fa';

const SalesReport = () => {
    const [sales, setSales] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, ordersRes] = await Promise.all([
                API.get('/sales'),
                API.get('/order')
            ]);
            setSales(salesRes.data.sales || []);
            setOrders(ordersRes.data.orders || []);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate sales statistics
    const calculateStats = () => {
        const completedOrders = orders.filter(order => order.status === 'Delivered');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalOrders = completedOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Monthly breakdown
        const monthlyData = {};
        completedOrders.forEach(order => {
            const month = new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            if (!monthlyData[month]) {
                monthlyData[month] = { revenue: 0, orders: 0 };
            }
            monthlyData[month].revenue += order.totalAmount || 0;
            monthlyData[month].orders += 1;
        });

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            monthlyData
        };
    };

    const stats = calculateStats();

    const filteredOrders = orders.filter(order => {
        // Only show delivered orders in sales report
        const isDelivered = order.status === 'Delivered';
        const matchesDate = !dateFilter || new Date(order.orderDate).toDateString() === new Date(dateFilter).toDateString();
        return isDelivered && matchesDate;
    });

    const exportReport = () => {
        const csvContent = [
            ['Order ID', 'Product', 'Customer', 'Quantity', 'Total Amount', 'Status', 'Date'],
            ...filteredOrders.map(order => [
                order._id,
                order.product?.name || 'N/A',
                order.customerName,
                order.quantity,
                order.totalAmount || 0,
                order.status,
                new Date(order.orderDate).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-2xl text-gray-600 font-semibold">Loading sales report...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-fadeInDown">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-relaxed pb-1">
                            Sales Report
                        </h1>
                        <p className="text-gray-600 text-lg">Comprehensive sales analytics for delivered orders only</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeInUp">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaDollarSign className="text-white text-2xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaBox className="text-white text-2xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 mb-1">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaChartLine className="text-white text-2xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 mb-1">Average Order Value</p>
                                <p className="text-2xl font-bold text-gray-800">${stats.averageOrderValue.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaCalendarAlt className="text-white text-2xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 mb-1">This Month</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    ${Object.values(stats.monthlyData).reduce((sum, month) => sum + month.revenue, 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Export */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 mb-8 animate-fadeInUp">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex items-center space-x-3">
                                <FaCalendarAlt className="text-gray-500 text-xl" />
                                <input
                                    type="date"
                                    className="border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={exportReport}
                            className="flex items-center space-x-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <FaDownload className="text-xl" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-fadeInUp">
                    <div className="px-8 py-6 border-b border-gray-200/50 bg-gray-50/80 backdrop-blur-lg">
                        <h3 className="text-2xl font-bold text-gray-800">Sales Details</h3>
                        <p className="text-lg text-gray-600 mt-1">Showing {filteredOrders.length} orders</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-gray-50/80 backdrop-blur-lg">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 backdrop-blur-lg divide-y divide-gray-200/50">
                                {filteredOrders.map((order, index) => (
                                    <tr 
                                        key={order._id} 
                                        className="hover:bg-white/70 transition-all duration-300 hover:shadow-lg"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            #{order._id.slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {order.product?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {order.customerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {order.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-violet-600">
                                            ${order.totalAmount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl border-2 backdrop-blur-lg ${
                                                order.status === 'Delivered' ? 'bg-green-100/80 text-green-800 border-green-200' :
                                                order.status === 'Pending' ? 'bg-yellow-100/80 text-yellow-800 border-yellow-200' :
                                                order.status === 'Cancelled' ? 'bg-red-100/80 text-red-800 border-red-200' :
                                                'bg-blue-100/80 text-blue-800 border-blue-200'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <FaChartLine className="text-4xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No sales data found</h3>
                            <p className="text-gray-600">No sales data found for the selected filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
