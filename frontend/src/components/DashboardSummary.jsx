import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBox, FaShoppingCart, FaTruck, FaUsers } from 'react-icons/fa';

const DashboardSummary = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalSuppliers: 0,
        totalUsers: 0,
        lowStockProducts: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);

    // Fetch dashboard statistics
    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('pos-token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch all data in parallel
            const [productsRes, ordersRes, suppliersRes, usersRes] = await Promise.all([
                axios.get('http://localhost:3000/api/product', { headers }),
                axios.get('http://localhost:3000/api/order', { headers }),
                axios.get('http://localhost:3000/api/supplier', { headers }),
                axios.get('http://localhost:3000/api/user', { headers })
            ]);

            const products = productsRes.data.products || [];
            const orders = ordersRes.data.orders || [];
            const suppliers = suppliersRes.data.suppliers || [];
            const users = usersRes.data.users || [];

            // Calculate statistics
            const lowStockProducts = products.filter(product => product.quantity < 10).length;
            const pendingOrders = orders.filter(order => order.status === 'Pending').length;

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                totalSuppliers: suppliers.length,
                totalUsers: users.length,
                lowStockProducts,
                pendingOrders
            });

            // Get recent orders (last 5)
            const sortedOrders = orders
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                .slice(0, 5);
            setRecentOrders(sortedOrders);

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color, bgColor }) => (
        <div className={`${bgColor} rounded-lg shadow-md p-6 flex items-center`}>
            <div className={`${color} text-3xl mr-4`}>
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={<FaBox />}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<FaShoppingCart />}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Total Suppliers"
                    value={stats.totalSuppliers}
                    icon={<FaTruck />}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<FaUsers />}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FaBox className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <span className="font-medium">Low Stock Alert:</span> {stats.lowStockProducts} products have less than 10 items in stock
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FaShoppingCart className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                <span className="font-medium">Pending Orders:</span> {stats.pendingOrders} orders are waiting to be processed
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
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
                                {recentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.customerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.product?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
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
                ) : (
                    <p className="text-gray-500 text-center py-4">No recent orders found</p>
                )}
            </div>
        </div>
    );
};

export default DashboardSummary;