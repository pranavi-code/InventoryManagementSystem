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
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesDate = !dateFilter || new Date(order.orderDate).toDateString() === new Date(dateFilter).toDateString();
        return matchesStatus && matchesDate;
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
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading sales report...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
                    <p className="text-gray-600 mt-2">Comprehensive sales analytics and reporting</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FaDollarSign className="text-green-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaBox className="text-blue-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FaChartLine className="text-purple-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                                <p className="text-2xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <FaCalendarAlt className="text-orange-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">This Month</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${Object.values(stats.monthlyData).reduce((sum, month) => sum + month.revenue, 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Export */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                        </div>
                        <button
                            onClick={exportReport}
                            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <FaDownload />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Sales Details</h3>
                        <p className="text-sm text-gray-600">Showing {filteredOrders.length} orders</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order._id.slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.product?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.customerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            ${order.totalAmount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {order.status}
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
                        <div className="text-center py-8 text-gray-500">
                            No sales data found for the selected filters
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
