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
    FaExclamationTriangle
} from 'react-icons/fa';

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Fetch every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await API.get('/order');
            const allOrders = response.data.orders || [];
            
            // Filter orders for current user
            if (user && (user.id || user._id)) {
                const userOrders = allOrders.filter(order => {
                    const orderUserId = order.user || order.userId || order.customerId;
                    const currentUserId = user.id || user._id;
                    return orderUserId === currentUserId;
                });
                setOrders(userOrders);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
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
                order.totalAmount?.toFixed(2) || '0.00',
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
        const filtered = filterOrders();
        return {
            total: filtered.length,
            totalAmount: filtered.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
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
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading order history...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-600 mt-2">Complete history of all your orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <FaBox className="text-blue-500 text-2xl" />
                    </div>
                </div>
                <div 
                    className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={handleCompletedCardClick}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <FaCheckCircle className="text-green-500 text-2xl" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Cancelled</p>
                            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                        </div>
                        <FaTimesCircle className="text-red-500 text-2xl" />
                    </div>
                </div>
            </div>

            {/* Filters and Export */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center space-x-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                        <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <input
                                type="date"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>

                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount-high">Amount: High to Low</option>
                            <option value="amount-low">Amount: Low to High</option>
                        </select>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                setStatusFilter('');
                                setDateFilter('');
                                setSortBy('newest');
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                        >
                            <FaDownload className="mr-2" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                {getStatusIcon(order.status)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{order._id.slice(-8)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.product?.name || 'Product Not Found'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order.product?.category?.categoryName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                        ${order.totalAmount?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            order.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                                            order.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                            order.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <FaBox className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-600">No orders found</p>
                        <p className="text-sm text-gray-500">
                            {statusFilter || dateFilter ? 'Try adjusting your filters' : 'No order history available'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination could be added here for large datasets */}
            {filteredOrders.length > 0 && (
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;