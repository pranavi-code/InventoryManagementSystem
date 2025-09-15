import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { getStatusIcon, getStatusColor } from '../../utils/orderUtils';
import {
    FaCalendarAlt,
    FaFilter,
    FaDownload,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaTruck,
    FaBox,
    FaExclamationTriangle,
    FaSync
} from 'react-icons/fa';

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [backendStats, setBackendStats] = useState(null);

    useEffect(() => {
        fetchOrdersAndStats();
        const interval = setInterval(fetchOrdersAndStats, 5000); // Fetch every 5 seconds for more responsive updates

        return () => clearInterval(interval);
    }, []);

    const fetchOrdersAndStats = async () => {
        try {
            setRefreshing(true);
            // Fetch both orders and stats in parallel
            const [ordersResponse, statsResponse] = await Promise.all([
                API.get('/order'),
                API.get('/order/stats')
            ]);
            
            const userOrders = ordersResponse.data.orders || [];
            const statsData = statsResponse.data.stats || [];
            
            console.log('Fetched orders for OrderHistory:', userOrders.length);
            console.log('Fetched stats for OrderHistory:', statsData);
            
            setOrders(userOrders);
            setBackendStats({
                stats: statsData,
                totalOrders: statsResponse.data.totalOrders || 0
            });
        } catch (error) {
            console.error('Error fetching orders and stats:', error);
            setOrders([]);
            setBackendStats(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchOrders = async () => {
        try {
            // Backend already filters orders for employees, so we can directly use the response
            const response = await API.get('/order');
            const userOrders = response.data.orders || [];
            
            console.log('Fetched orders for OrderHistory:', userOrders.length);
            setOrders(userOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Filter by date
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            const nextDay = new Date(filterDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.orderDate);
                return orderDate >= filterDate && orderDate < nextDay;
            });
        }

        // Sort orders
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.orderDate) - new Date(a.orderDate);
                case 'oldest':
                    return new Date(a.orderDate) - new Date(b.orderDate);
                case 'amount-high':
                    return (b.totalAmount || 0) - (a.totalAmount || 0);
                case 'amount-low':
                    return (a.totalAmount || 0) - (b.totalAmount || 0);
                default:
                    return new Date(b.orderDate) - new Date(a.orderDate);
            }
        });

        return filtered;
    };

    const exportToCSV = () => {
        const filteredOrders = filterOrders();
        const csvContent = [
            ['Order ID', 'Product', 'Quantity', 'Status', 'Total Amount', 'Order Date', 'Priority'].join(','),
            ...filteredOrders.map(order => [
                order._id,
                order.product?.name || 'N/A',
                order.quantity,
                order.status,
                (order.totalAmount || (order.product?.price * order.quantity))?.toFixed(2) || '0.00',
                new Date(order.orderDate).toLocaleDateString(),
                order.priority
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getOrderStats = () => {
        // If no filters are applied and we have backend stats, use them for better performance
        if (!statusFilter && !dateFilter && backendStats) {
            const processedStats = {
                total: backendStats.totalOrders,
                totalAmount: 0,
                pending: 0,
                completed: 0,
                cancelled: 0
            };

            // Process backend stats
            console.log('Backend stats received:', backendStats.stats);
            backendStats.stats.forEach(stat => {
                console.log('Processing stat:', stat);
                if (stat._id === 'Pending') processedStats.pending = stat.count;
                if (stat._id === 'Delivered') processedStats.completed = stat.count;
                if (['Cancelled', 'Rejected'].includes(stat._id)) {
                    processedStats.cancelled += stat.count;
                }
                // Include all orders except cancelled/rejected ones in total amount
                if (!['Cancelled', 'Rejected'].includes(stat._id)) {
                    processedStats.totalAmount += stat.totalAmount || 0;
                }
            });

            console.log('Final processed stats:', processedStats);

            return processedStats;
        }

        // Fall back to client-side calculation when filters are applied
        const filtered = filterOrders();
        return {
            total: filtered.length,
            totalAmount: filtered.reduce((sum, order) => {
                // Include all orders except cancelled/rejected ones
                if (!['Cancelled', 'Rejected'].includes(order.status)) {
                    return sum + (order.totalAmount || (order.product?.price * order.quantity) || 0);
                }
                return sum;
            }, 0),
            pending: filtered.filter(order => order.status === 'Pending').length,
            completed: filtered.filter(order => order.status === 'Delivered').length,
            cancelled: filtered.filter(order => ['Cancelled', 'Rejected'].includes(order.status)).length
        };
    };

    const handleCompletedCardClick = () => {
        setStatusFilter('Delivered');
    };

    const stats = getOrderStats();
    const filteredOrders = filterOrders();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
                    <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Loading order history...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    Order History 📋
                                </h1>
                                <p className="text-gray-600 text-lg">Complete history of all your orders with advanced filtering</p>
                            </div>
                            <button
                                onClick={fetchOrdersAndStats}
                                disabled={refreshing}
                                className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <FaSync className={refreshing ? 'animate-spin' : ''} />
                                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:bg-white/30 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                                <p className="text-xs text-gray-500 mt-1">All time</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaBox className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                    
                    <div 
                        className={`bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 cursor-pointer hover:bg-white/30 transition-all duration-300 hover:scale-105 group ${
                            statusFilter === 'Delivered' ? 'ring-2 ring-green-500 bg-green-50/30' : ''
                        }`}
                        onClick={handleCompletedCardClick}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {orders.filter(order => order.status === 'Delivered').length}
                                </p>
                                <p className="text-xs text-green-500 mt-1">
                                    {statusFilter === 'Delivered' ? 'Filter Active' : 'Click to view'}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <FaCheckCircle className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:bg-white/30 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cancelled Orders</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {orders.filter(order => ['Cancelled', 'Rejected'].includes(order.status)).length}
                                </p>
                                <p className="text-xs text-red-500 mt-1">Rejected/Cancelled</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaTimesCircle className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Export */}
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center space-x-4">
                                <FaFilter className="text-blue-600 text-lg" />
                                <select
                                    className="border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg appearance-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-4">
                                <FaCalendarAlt className="text-purple-600 text-lg" />
                                <input
                                    type="date"
                                    className="border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>

                            <select
                                className="border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg appearance-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                            </select>

                            <span className="text-sm text-gray-600 font-semibold">
                                Showing {filteredOrders.length} of {orders.length} orders
                            </span>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setStatusFilter('');
                                    setDateFilter('');
                                    setSortBy('newest');
                                }}
                                className="px-6 py-3 border-2 border-white/50 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-lg"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                            >
                                <FaDownload />
                                <span>Export CSV</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg">
                                                {getStatusIcon(order.status)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900">
                                                    {order.product?.name || 'Product Not Found'}
                                                </h3>
                                                <p className="text-sm text-gray-600 font-medium">
                                                    Order ID: <span className="font-bold text-blue-600">#{order._id.slice(-8)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-2xl ${getStatusColor(order.status)} shadow-lg`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                            <p className="text-sm text-gray-600 font-semibold">Quantity</p>
                                            <p className="font-bold text-lg text-gray-900">{order.quantity}</p>
                                        </div>
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                            <p className="text-sm text-gray-600 font-semibold">Total Amount</p>
                                            <p className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                ${(() => {
                                                    const totalAmount = order.totalAmount;
                                                    const calculatedAmount = order.product?.price * order.quantity;
                                                    const finalAmount = totalAmount || calculatedAmount || 0;
                                                    console.log('Order Total Debug:', {
                                                        orderId: order._id?.slice(-8),
                                                        totalAmount,
                                                        productPrice: order.product?.price,
                                                        quantity: order.quantity,
                                                        calculatedAmount,
                                                        finalAmount
                                                    });
                                                    return finalAmount.toFixed(2);
                                                })()}
                                            </p>
                                        </div>
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                            <p className="text-sm text-gray-600 font-semibold">Order Date</p>
                                            <p className="font-bold text-lg text-gray-900">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                            <p className="text-sm text-gray-600 font-semibold">Priority</p>
                                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                                                order.priority === 'Urgent' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' :
                                                order.priority === 'High' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                                                order.priority === 'Medium' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' :
                                                'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                                            }`}>
                                                {order.priority}
                                            </span>
                                        </div>
                                    </div>

                                    {order.notes && (
                                        <div className="mb-6">
                                            <p className="text-sm text-gray-600 font-semibold mb-2">Notes</p>
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                                                <p className="text-sm text-blue-800">{order.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {order.rejectionReason && (
                                        <div className="mb-6">
                                            <p className="text-sm text-red-600 font-semibold mb-2">Rejection Reason</p>
                                            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-100">
                                                <p className="text-sm text-red-800 font-medium">{order.rejectionReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    {order.estimatedDelivery && (
                                        <div className="mb-6">
                                            <p className="text-sm text-gray-600 font-semibold mb-2">Estimated Delivery</p>
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                                                <p className="text-sm font-bold text-green-800">
                                                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                            <FaBox className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-3">No orders found</h3>
                        <p className="text-gray-600">
                            {statusFilter || dateFilter ? 'Try adjusting your filters' : 'No order history available'}
                        </p>
                    </div>
                )}

                {/* Pagination Summary */}
                {filteredOrders.length > 0 && (
                    <div className="mt-8 bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-700 font-medium">
                                Showing {filteredOrders.length} of {orders.length} orders
                            </p>
                            <div className="text-sm text-gray-600">
                                Total Amount: <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    ${filteredOrders.reduce((sum, order) => {
                                        // Include all orders except cancelled/rejected ones
                                        if (!['Cancelled', 'Rejected'].includes(order.status)) {
                                            const orderTotal = order.totalAmount || (order.product?.price * order.quantity) || 0;
                                            return sum + orderTotal;
                                        }
                                        return sum;
                                    }, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;