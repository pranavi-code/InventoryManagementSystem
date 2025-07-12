import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { getStatusIcon, getStatusColor } from '../../utils/orderUtils';
import {
    FaBell,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaExclamationTriangle,
    FaTruck,
    FaTrash,
    FaMarkdown
} from 'react-icons/fa';

const EmployeeNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
        // Set up polling for real-time notifications
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Fetch orders to generate notifications
            const response = await API.get('/order');
            const orders = response.data.orders || [];
            
            // Generate notifications based on order status changes
            const generatedNotifications = generateNotifications(orders);
            setNotifications(generatedNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateNotifications = (orders) => {
        const notifications = [];
        const now = new Date();

        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const daysSinceOrder = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

            // Order status notifications
            if (order.status === 'Approved' && order.approvedDate) {
                const approvedDate = new Date(order.approvedDate);
                const hoursSinceApproval = Math.floor((now - approvedDate) / (1000 * 60 * 60));
                
                if (hoursSinceApproval <= 24) {
                    notifications.push({
                        id: `approved-${order._id}`,
                        type: 'success',
                        title: 'Order Approved',
                        message: `Your order for ${order.product?.name} has been approved!`,
                        timestamp: order.approvedDate,
                        orderId: order._id,
                        read: false
                    });
                }
            }

            if (order.status === 'Rejected' && order.rejectionReason) {
                notifications.push({
                    id: `rejected-${order._id}`,
                    type: 'error',
                    title: 'Order Rejected',
                    message: `Your order for ${order.product?.name} was rejected: ${order.rejectionReason}`,
                    timestamp: order.orderDate,
                    orderId: order._id,
                    read: false
                });
            }

            if (order.status === 'Shipped') {
                notifications.push({
                    id: `shipped-${order._id}`,
                    type: 'info',
                    title: 'Order Shipped',
                    message: `Your order for ${order.product?.name} has been shipped!`,
                    timestamp: order.orderDate,
                    orderId: order._id,
                    read: false
                });
            }

            if (order.status === 'Delivered') {
                notifications.push({
                    id: `delivered-${order._id}`,
                    type: 'success',
                    title: 'Order Delivered',
                    message: `Your order for ${order.product?.name} has been delivered!`,
                    timestamp: order.orderDate,
                    orderId: order._id,
                    read: false
                });
            }

            // Pending order reminders
            if (order.status === 'Pending' && daysSinceOrder >= 3) {
                notifications.push({
                    id: `pending-${order._id}`,
                    type: 'warning',
                    title: 'Order Pending',
                    message: `Your order for ${order.product?.name} has been pending for ${daysSinceOrder} days.`,
                    timestamp: order.orderDate,
                    orderId: order._id,
                    read: false
                });
            }

            // Estimated delivery notifications
            if (order.estimatedDelivery && order.status === 'Shipped') {
                const deliveryDate = new Date(order.estimatedDelivery);
                const daysUntilDelivery = Math.ceil((deliveryDate - now) / (1000 * 60 * 60 * 24));
                
                if (daysUntilDelivery <= 1 && daysUntilDelivery >= 0) {
                    notifications.push({
                        id: `delivery-reminder-${order._id}`,
                        type: 'info',
                        title: 'Delivery Reminder',
                        message: `Your order for ${order.product?.name} is expected to arrive ${daysUntilDelivery === 0 ? 'today' : 'tomorrow'}!`,
                        timestamp: new Date(),
                        orderId: order._id,
                        read: false
                    });
                }
            }
        });

        // Sort by timestamp (newest first)
        return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };


    const markAsRead = (notificationId) => {
        setNotifications(notifications.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const deleteNotification = (notificationId) => {
        setNotifications(notifications.filter(notif => notif.id !== notificationId));
    };

    const clearAllNotifications = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    });

    const unreadCount = notifications.filter(notif => !notif.read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-2">
                            Stay updated with your order status and important updates
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <select
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Notifications</option>
                            <option value="unread">Unread Only</option>
                            <option value="read">Read Only</option>
                        </select>
                        <span className="text-sm text-gray-600">
                            Showing {filteredNotifications.length} notifications
                        </span>
                    </div>

                    <div className="flex space-x-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                            >
                                <FaMarkdown className="mr-2" />
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                            >
                                <FaTrash className="mr-2" />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getNotificationColor(notification.type)} ${
                            !notification.read ? 'ring-2 ring-blue-100' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mb-2">{notification.message}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                        {notification.orderId && (
                                            <span>Order: #{notification.orderId.slice(-8)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Mark as read
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <FaTrash className="text-sm" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredNotifications.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                    <FaBell className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">No notifications found</p>
                    <p className="text-sm text-gray-500">
                        {filter === 'unread' ? 'All notifications have been read' : 
                         filter === 'read' ? 'No read notifications' : 
                         'You\'ll see notifications here when there are updates to your orders'}
                    </p>
                </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                    Notifications auto-refresh every 30 seconds
                </p>
            </div>
        </div>
    );
};

export default EmployeeNotifications;