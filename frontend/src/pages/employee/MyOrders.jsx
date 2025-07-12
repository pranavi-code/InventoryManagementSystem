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
            await API.put(`/api/order/${selectedOrder._id}`, editForm);
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
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-2">Track and manage your order requests</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center space-x-4">
                    <FaFilter className="text-gray-400" />
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <span className="text-sm text-gray-600">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </span>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {order.product?.name || 'Product Not Found'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Order ID: {order._id.slice(-8)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Quantity</p>
                                        <p className="font-medium">{order.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="font-medium text-green-600">
                                            ${order.totalAmount?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Order Date</p>
                                        <p className="font-medium">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Priority</p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                                            {order.priority}
                                        </span>
                                    </div>
                                </div>

                                {order.notes && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Notes</p>
                                        <p className="text-sm bg-gray-50 p-2 rounded">{order.notes}</p>
                                    </div>
                                )}

                                {order.rejectionReason && (
                                    <div className="mb-4">
                                        <p className="text-sm text-red-600">Rejection Reason</p>
                                        <p className="text-sm bg-red-50 p-2 rounded text-red-800">{order.rejectionReason}</p>
                                    </div>
                                )}

                                {order.estimatedDelivery && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                                        <p className="text-sm font-medium">
                                            {new Date(order.estimatedDelivery).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end space-y-3 mt-4 lg:mt-0">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center"
                                    >
                                        <FaEye className="mr-1" />
                                        View
                                    </button>

                                    {canEditOrder(order) && (
                                        <button
                                            onClick={() => openEditModal(order)}
                                            className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium flex items-center"
                                        >
                                            <FaEdit className="mr-1" />
                                            Edit
                                        </button>
                                    )}

                                    {canCancelOrder(order) && (
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center"
                                        >
                                            <FaTimes className="mr-1" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                    <FaClock className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">No orders found</p>
                    <p className="text-sm text-gray-500">
                        {statusFilter ? 'Try changing the filter' : 'Place your first order to get started'}
                    </p>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && !showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-semibold">Order Details</h3>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium">Order ID:</span>
                                        <p className="text-gray-600">{selectedOrder._id}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span>
                                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium">Product:</span>
                                        <p className="text-gray-600">{selectedOrder.product?.name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Quantity:</span>
                                        <p className="text-gray-600">{selectedOrder.quantity}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium">Priority:</span>
                                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedOrder.priority)}`}>
                                            {selectedOrder.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Total Amount:</span>
                                        <p className="text-green-600 font-semibold">
                                            ${selectedOrder.totalAmount?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium">Order Date:</span>
                                        <p className="text-gray-600">
                                            {new Date(selectedOrder.orderDate).toLocaleString()}
                                        </p>
                                    </div>
                                    {selectedOrder.approvedDate && (
                                        <div>
                                            <span className="font-medium">Approved Date:</span>
                                            <p className="text-gray-600">
                                                {new Date(selectedOrder.approvedDate).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedOrder.estimatedDelivery && (
                                    <div>
                                        <span className="font-medium">Estimated Delivery:</span>
                                        <p className="text-gray-600">
                                            {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.notes && (
                                    <div>
                                        <span className="font-medium">Notes:</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                            {selectedOrder.notes}
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.rejectionReason && (
                                    <div>
                                        <span className="font-medium text-red-600">Rejection Reason:</span>
                                        <p className="text-red-800 bg-red-50 p-3 rounded mt-1">
                                            {selectedOrder.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.approvedBy && (
                                    <div>
                                        <span className="font-medium">Approved By:</span>
                                        <p className="text-gray-600">{selectedOrder.approvedBy.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-semibold">Edit Order</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleEditOrder}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product: {selectedOrder.product?.name}
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editForm.quantity}
                                            onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                        <select
                                            value={editForm.priority}
                                            onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                        <textarea
                                            value={editForm.notes}
                                            onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Any special instructions..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedOrder(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
    );
};

export default MyOrders;