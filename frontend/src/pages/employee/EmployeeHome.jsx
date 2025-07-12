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
    FaBox
} from 'react-icons/fa';
import { Link } from 'react-router';

const EmployeeHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                API.get('/order/stats'),
                API.get('/order')
            ]);

            setStats(statsRes.data.stats || []);
            setRecentOrders(ordersRes.data.orders?.slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusCount = (status) => {
        const statusStat = stats.find(stat => stat._id === status);
        return statusStat ? statusStat.count : 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600 mt-2">Here's an overview of your orders and activities</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.reduce((total, stat) => total + stat.count, 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaShoppingCart className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                            <p className="text-3xl font-bold text-yellow-600">{getStatusCount('Pending')}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <FaClock className="text-yellow-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Cancelled Orders</p>
                            <p className="text-3xl font-bold text-red-600">{getStatusCount('Cancelled')}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <FaTimesCircle className="text-red-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
                            <p className="text-3xl font-bold text-blue-600">{getStatusCount('Delivered')}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaTruck className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Link 
                    to="/employee-dashboard/place-order"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                    <div className="flex items-center space-x-4">
                        <FaShoppingCart className="text-2xl" />
                        <div>
                            <h3 className="text-lg font-semibold">Place New Order</h3>
                            <p className="text-blue-100">Order products from inventory</p>
                        </div>
                    </div>
                </Link>

                <Link 
                    to="/employee-dashboard/my-orders"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                    <div className="flex items-center space-x-4">
                        <FaClipboardCheck className="text-2xl" />
                        <div>
                            <h3 className="text-lg font-semibold">View My Orders</h3>
                            <p className="text-green-100">Track your order status</p>
                        </div>
                    </div>
                </Link>

                <Link 
                    to="/employee-dashboard/products"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                    <div className="flex items-center space-x-4">
                        <FaBox className="text-2xl" />
                        <div>
                            <h3 className="text-lg font-semibold">Browse Products</h3>
                            <p className="text-purple-100">View available inventory</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                        <Link 
                            to="/employee-dashboard/my-orders"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All
                        </Link>
                    </div>
                </div>
                <div className="p-6">
                    {recentOrders.length > 0 ? (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            {getStatusIcon(order.status)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{order.product?.name}</h4>
                                            <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FaShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
                            <p className="text-gray-600">No orders yet</p>
                            <Link 
                                to="/employee-dashboard/place-order"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Place your first order
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeHome;