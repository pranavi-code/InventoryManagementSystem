import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { FaSearch, FaEdit, FaTrash, FaEye, FaClock, FaCheckCircle, FaTruck, FaBox, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-400",
    Approved: "bg-green-100 text-green-800 border-green-400",
    Processing: "bg-blue-100 text-blue-800 border-blue-400",
    Shipped: "bg-purple-100 text-purple-800 border-purple-400",
    Delivered: "bg-green-100 text-green-800 border-green-400",
    Cancelled: "bg-red-100 text-red-800 border-red-400",
    Rejected: "bg-red-100 text-red-800 border-red-400"
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'Pending': return <FaClock className="text-yellow-500" />;
        case 'Approved': return <FaCheckCircle className="text-green-500" />;
        case 'Processing': return <FaBox className="text-blue-500" />;
        case 'Shipped': return <FaTruck className="text-purple-500" />;
        case 'Delivered': return <FaCheckCircle className="text-green-600" />;
        case 'Cancelled': return <FaTimesCircle className="text-red-500" />;
        case 'Rejected': return <FaExclamationTriangle className="text-red-600" />;
        default: return <FaClock className="text-gray-500" />;
    }
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOrderId, setEditOrderId] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [orderRes, prodRes] = await Promise.all([
                API.get('/order'),
                API.get('/product'),
            ]);
            setOrders(orderRes.data.orders || []);
            setProducts(prodRes.data.products || []);
        } catch (error) {
            console.error('Error fetching orders/products:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const getProductStock = (productId) => {
        const prod = products.find(p => p._id === (productId._id || productId));
        return prod ? prod.quantity : '-';
    };

    const handleStatusEdit = (order) => {
        setEditOrderId(order._id);
        setEditStatus(order.status);
    };

    const handleStatusSave = async (orderId) => {
        try {
            const response = await API.put(`/order/${orderId}/status`, { 
                status: editStatus 
            });
            if (response.data.success) {
                setEditOrderId(null);
                setEditStatus('');
                fetchAll();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.error || 'Error updating status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                const response = await API.delete(`/order/${id}`);
                if (response.data.success) {
                    fetchAll();
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                alert(error.response?.data?.error || 'Error deleting order');
            }
        }
    };

    const showOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                            (order.product?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getTotalAmount = () => {
        return filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="relative mb-8 animate-fadeInDown">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-relaxed pb-1">
                        Orders Management
                    </h1>
                    <p className="text-gray-600 text-lg">Track and manage all customer orders</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fadeInUp">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-800">{filteredOrders.length}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaBox className="text-white text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {filteredOrders.filter(o => o.status === 'Pending').length}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaClock className="text-white text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Delivered</p>
                            <p className="text-3xl font-bold text-green-600">
                                {filteredOrders.filter(o => o.status === 'Delivered').length}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaCheckCircle className="text-white text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-emerald-600">${getTotalAmount().toFixed(2)}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaCheckCircle className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative flex flex-col lg:flex-row gap-6 mb-8 animate-fadeInUp">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl z-10" />
                    <input
                        type="text"
                        placeholder="Search by customer or product..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400 shadow-lg"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg shadow-lg"
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

            {/* Orders Table */}
            {loading ? (
                <div className="relative flex items-center justify-center h-64 animate-fadeInUp">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                        <div className="text-2xl text-gray-600 font-semibold">Loading orders...</div>
                    </div>
                </div>
            ) : (
                <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-fadeInUp">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-gray-50/80 backdrop-blur-lg">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Product & Quantity
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                #{order._id.slice(-8)}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">
                                                Priority: {order.priority || 'Medium'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {order.customerName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {order.product?.name || 'Product not found'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Qty: {order.quantity} | Stock: {getProductStock(order.product)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-emerald-600">
                                                ${order.totalAmount?.toFixed(2) || '0.00'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editOrderId === order._id ? (
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        className="text-sm border-2 border-white/50 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-lg focus:ring-2 focus:ring-rose-500/20"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleStatusSave(order._id)}
                                                        className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-all duration-200"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setEditOrderId(null)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-lg ${statusColors[order.status]}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="ml-2">{order.status}</span>
                                                    </span>
                                                    <button
                                                        onClick={() => handleStatusEdit(order)}
                                                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => showOrderDetails(order)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(order._id)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110"
                                                    title="Delete Order"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <FaBox className="text-4xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No orders found</h3>
                            <p className="text-gray-600">Orders will appear here when customers place them</p>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-white/20 animate-slideInUp">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                Order Details
                            </h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-3 rounded-xl hover:bg-gray-100/50 transition-all duration-200 hover:scale-110"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gray-50/80 rounded-2xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Order ID</label>
                                <p className="text-lg font-mono text-gray-900">#{selectedOrder._id.slice(-8)}</p>
                            </div>
                            <div className="bg-gray-50/80 rounded-2xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Customer</label>
                                <p className="text-lg text-gray-900 font-semibold">{selectedOrder.customerName}</p>
                            </div>
                            <div className="bg-gray-50/80 rounded-2xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product</label>
                                <p className="text-lg text-gray-900 font-semibold">{selectedOrder.product?.name || 'Product not found'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50/80 rounded-2xl p-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                                    <p className="text-lg text-gray-900 font-semibold">{selectedOrder.quantity}</p>
                                </div>
                                <div className="bg-gray-50/80 rounded-2xl p-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Amount</label>
                                    <p className="text-lg font-bold text-emerald-600">${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50/80 rounded-2xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 ${statusColors[selectedOrder.status]}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span className="ml-2">{selectedOrder.status}</span>
                                </span>
                            </div>
                            <div className="bg-gray-50/80 rounded-2xl p-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Order Date</label>
                                <p className="text-lg text-gray-900 font-semibold">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                            </div>
                            {selectedOrder.notes && (
                                <div className="bg-gray-50/80 rounded-2xl p-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                                    <p className="text-lg text-gray-900 leading-relaxed">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;