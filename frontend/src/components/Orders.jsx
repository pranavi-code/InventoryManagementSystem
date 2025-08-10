import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
            const token = localStorage.getItem('pos-token');
            const [orderRes, prodRes] = await Promise.all([
                axios.get('http://localhost:3000/api/order', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:3000/api/product', { headers: { Authorization: `Bearer ${token}` } }),
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
            const response = await axios.put(
                `http://localhost:3000/api/order/${orderId}/status`,
                { status: editStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` } }
            );
            if (response.data.success) {
                setEditOrderId(null);
                setEditStatus('');
                fetchAll();
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/order/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` }
                });
                if (response.data.success) {
                    fetchAll();
                }
            } catch (error) {
                alert('Error deleting order');
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
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
                <p className="text-gray-600">Track and manage all customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900">{filteredOrders.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaBox className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {filteredOrders.filter(o => o.status === 'Pending').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <FaClock className="text-yellow-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Delivered</p>
                            <p className="text-3xl font-bold text-green-600">
                                {filteredOrders.filter(o => o.status === 'Delivered').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FaCheckCircle className="text-green-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-3xl font-bold text-emerald-600">${getTotalAmount().toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FaCheckCircle className="text-emerald-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer or product..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">Loading orders...</div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product & Quantity
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order._id.slice(-8)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Priority: {order.priority || 'Medium'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.customerName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.customerEmail || 'No email'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.product?.name || 'Product not found'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Qty: {order.quantity} | Stock: {getProductStock(order.product)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-green-600">
                                                ${order.totalAmount?.toFixed(2) || '0.00'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editOrderId === order._id ? (
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        className="text-sm border border-gray-300 rounded px-2 py-1"
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
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setEditOrderId(null)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="ml-1">{order.status}</span>
                                                    </span>
                                                    <button
                                                        onClick={() => handleStatusEdit(order)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => showOrderDetails(order)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(order._id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
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
                        <div className="text-center py-12">
                            <FaBox className="mx-auto text-4xl text-gray-400 mb-4" />
                            <p className="text-gray-600">No orders found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Order ID</label>
                                <p className="text-sm text-gray-900">#{selectedOrder._id.slice(-8)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer</label>
                                <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product</label>
                                <p className="text-sm text-gray-900">{selectedOrder.product?.name || 'Product not found'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <p className="text-sm text-gray-900">{selectedOrder.quantity}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                                <p className="text-sm font-bold text-green-600">${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedOrder.status]}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span className="ml-1">{selectedOrder.status}</span>
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Order Date</label>
                                <p className="text-sm text-gray-900">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                            </div>
                            {selectedOrder.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
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