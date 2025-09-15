import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { getStatusIcon, getStatusColor, getPriorityColor } from '../../utils/orderUtils.jsx';
import {
    FaEye,
    FaEdit,
    FaTimes,
    FaFilter,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaTruck,
    FaBox,
    FaExclamationTriangle
} from 'react-icons/fa';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        quantity: 1,
        priority: 'Medium',
        notes: ''
    });

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // ESC key handler for closing modals
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                if (showEditModal) {
                    setShowEditModal(false);
                    setSelectedOrder(null);
                } else if (selectedOrder) {
                    setSelectedOrder(null);
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [selectedOrder, showEditModal]);

    const fetchOrders = async () => {
        try {
            const response = await API.get('/order');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            await API.put(`/order/${orderId}/cancel`);
            alert('Order cancelled successfully');
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.error || 'Error cancelling order');
        }
    };

    const handleEditOrder = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/order/${selectedOrder._id}`, editForm);
            alert('Order updated successfully');
            setShowEditModal(false);
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.error || 'Error updating order');
        }
    };

    const openEditModal = (order) => {
        setSelectedOrder(order);
        setEditForm({
            quantity: order.quantity,
            priority: order.priority,
            notes: order.notes || ''
        });
        setShowEditModal(true);
    };


    const filteredOrders = orders.filter(order => 
        !statusFilter || order.status === statusFilter
    );

    const canEditOrder = (order) => {
        return order.status === 'Pending';
    };

    const canCancelOrder = (order) => {
        return ['Pending', 'Approved'].includes(order.status);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
                    <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Loading orders...</div>
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
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            My Orders
                        </h1>
                        <p className="text-gray-600 text-lg">Track and manage your order requests with real-time updates</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
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
                        <span className="text-sm text-gray-600 font-semibold">
                            Showing {filteredOrders.length} of {orders.length} orders
                        </span>
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
                                                    Order ID: <span className="font-bold text-blue-600">{order._id.slice(-8)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-2xl ${getStatusColor(order.status)} shadow-lg`}>
                                                {order.status}
                                            </span>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                                            >
                                                <FaEye />
                                                <span>View</span>
                                            </button>
                                            {canEditOrder(order) && (
                                                <button
                                                    onClick={() => openEditModal(order)}
                                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                                                >
                                                    <FaEdit />
                                                    <span>Edit</span>
                                                </button>
                                            )}
                                            {canCancelOrder(order) && (
                                                <button
                                                    onClick={() => handleCancelOrder(order._id)}
                                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                                                >
                                                    <FaTimes />
                                                    <span>Cancel</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                            <p className="text-sm text-gray-600 font-semibold">Quantity</p>
                                            <p className="font-bold text-lg text-gray-900">{order.quantity}</p>
                                        </div>
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                            <p className="text-sm text-gray-600 font-semibold">Total Amount</p>
                                            <p className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                ${(order.totalAmount || (order.product?.price * order.quantity))?.toFixed(2) || '0.00'}
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
                                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(order.priority)}`}>
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
                <div className="text-center py-16 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/20">
                    <FaClock className="mx-auto text-5xl text-gray-400 mb-6" />
                    <p className="text-gray-600 text-lg font-semibold">No orders found</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {statusFilter ? 'Try changing the filter' : 'Place your first order to get started'}
                    </p>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && !showEditModal && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div 
                        className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Order Details</h3>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600 text-xl p-2 hover:bg-gray-100/50 rounded-full transition-all duration-200"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <span className="font-medium text-gray-700">Order ID:</span>
                                            <p className="text-gray-900 font-semibold">{selectedOrder._id}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Status:</span>
                                            <span className={`ml-2 inline-flex px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(selectedOrder.status)} shadow-sm`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <span className="font-medium text-gray-700">Product:</span>
                                            <p className="text-gray-900 font-semibold">{selectedOrder.product?.name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Quantity:</span>
                                            <p className="text-gray-900 font-semibold">{selectedOrder.quantity}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <span className="font-medium text-gray-700">Priority:</span>
                                            <span className={`ml-2 inline-flex px-3 py-1 text-sm font-bold rounded-full ${getPriorityColor(selectedOrder.priority)} shadow-sm`}>
                                                {selectedOrder.priority}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Total Amount:</span>
                                            <p className="text-green-600 font-bold text-lg">
                                                ${(selectedOrder.totalAmount || (selectedOrder.product?.price * selectedOrder.quantity))?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <span className="font-medium text-gray-700">Order Date:</span>
                                            <p className="text-gray-900 font-semibold">
                                                {new Date(selectedOrder.orderDate).toLocaleString()}
                                            </p>
                                        </div>
                                        {selectedOrder.approvedDate && (
                                            <div>
                                                <span className="font-medium text-gray-700">Approved Date:</span>
                                                <p className="text-gray-900 font-semibold">
                                                    {new Date(selectedOrder.approvedDate).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedOrder.estimatedDelivery && (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                        <span className="font-medium text-gray-700">Estimated Delivery:</span>
                                        <p className="text-gray-900 font-semibold">
                                            {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.notes && (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                        <span className="font-medium text-gray-700">Notes:</span>
                                        <p className="text-gray-900 bg-blue-50/70 p-4 rounded-xl mt-2 border border-blue-200/50">
                                            {selectedOrder.notes}
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.rejectionReason && (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                        <span className="font-medium text-red-600">Rejection Reason:</span>
                                        <p className="text-red-900 bg-red-50/70 p-4 rounded-xl mt-2 border border-red-200/50">
                                            {selectedOrder.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.approvedBy && (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                                        <span className="font-medium text-gray-700">Approved By:</span>
                                        <p className="text-gray-900 font-semibold">{selectedOrder.approvedBy.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-md w-full">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Edit Order</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleEditOrder}>
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                                        <label className="block text-sm font-semibold text-blue-700 mb-2">
                                            Product: {selectedOrder.product?.name}
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editForm.quantity}
                                            onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                                            className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Priority</label>
                                        <select
                                            value={editForm.priority}
                                            onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                            className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg appearance-none"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Notes</label>
                                        <textarea
                                            value={editForm.notes}
                                            onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                            className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg resize-none"
                                            rows="3"
                                            placeholder="Any special instructions..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedOrder(null);
                                        }}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                                    >
                                        Update Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default MyOrders;