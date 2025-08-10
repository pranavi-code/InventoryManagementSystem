import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { io } from 'socket.io-client';
import {
    FaBell,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaExclamationTriangle,
    FaTruck,
    FaTrash,
    FaMarkdown,
    FaFilter,
    FaEnvelope,
    FaEnvelopeOpen,
    FaClock
} from 'react-icons/fa';

const EmployeeNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const socketRef = useRef(null);

    // Load persisted notification states from localStorage
    const loadPersistedStates = () => {
        try {
            const persisted = localStorage.getItem('employeeNotificationStates');
            return persisted ? JSON.parse(persisted) : {};
        } catch (error) {
            console.error('Error loading persisted states:', error);
            return {};
        }
    };

    // Save notification states to localStorage
    const savePersistedStates = (states) => {
        try {
            localStorage.setItem('employeeNotificationStates', JSON.stringify(states));
        } catch (error) {
            console.error('Error saving persisted states:', error);
        }
    };

    // Load cleared notifications from localStorage
    const loadClearedNotifications = () => {
        try {
            const cleared = localStorage.getItem('employeeClearedNotifications');
            return cleared ? JSON.parse(cleared) : [];
        } catch (error) {
            console.error('Error loading cleared notifications:', error);
            return [];
        }
    };

    // Save cleared notifications to localStorage
    const saveClearedNotifications = (clearedIds) => {
        try {
            localStorage.setItem('employeeClearedNotifications', JSON.stringify(clearedIds));
        } catch (error) {
            console.error('Error saving cleared notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        setupSocketConnection();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user]);

    const setupSocketConnection = () => {
        socketRef.current = io('http://localhost:3000');
        
        socketRef.current.on('notification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
        });

        socketRef.current.on('order_status_update', () => {
            fetchNotifications();
        });
    };

    const fetchNotifications = async () => {
        try {
            if (!user || !(user.id || user._id)) return;

            // Get user's orders to generate notifications
            const ordersRes = await API.get('/order');
            const allOrders = ordersRes.data.orders || [];
            
            // Filter orders for current user
            const userOrders = allOrders.filter(order => 
                order.user === (user.id || user._id) || 
                order.userId === (user.id || user._id)
            );

            // Generate notifications based on user's orders
            const generatedNotifications = generateNotifications(userOrders);
            
            // Apply persisted states
            const persistedStates = loadPersistedStates();
            const clearedNotifications = loadClearedNotifications();
            
            const processedNotifications = generatedNotifications
                .filter(notification => !clearedNotifications.includes(notification.id))
                .map(notification => ({
                    ...notification,
                    read: persistedStates[notification.id]?.read ?? notification.read
                }));
            
            setNotifications(processedNotifications);
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

            // Order status notifications - show recent status changes
            if (order.status === 'Approved') {
                const approvedDate = order.approvedDate ? new Date(order.approvedDate) : orderDate;
                const hoursSinceApproval = Math.floor((now - approvedDate) / (1000 * 60 * 60));
                
                if (hoursSinceApproval <= 48) { // Show for 48 hours
                    notifications.push({
                        id: `approved-${order._id}`,
                        type: 'success',
                        title: 'Order Approved',
                        message: `Your order for ${order.product?.name} has been approved!`,
                        orderId: order._id,
                        read: false,
                        priority: 'medium'
                    });
                }
            }

            if (order.status === 'Rejected' && order.rejectionReason) {
                const hoursSinceRejection = Math.floor((now - orderDate) / (1000 * 60 * 60));
                if (hoursSinceRejection <= 72) { // Show for 72 hours
                    notifications.push({
                        id: `rejected-${order._id}`,
                        type: 'error',
                        title: 'Order Rejected',
                        message: `Your order for ${order.product?.name} was rejected: ${order.rejectionReason}`,
                        timestamp: orderDate,
                        orderId: order._id,
                        read: false,
                        priority: 'high'
                    });
                }
            }

            if (order.status === 'Shipped') {
                const hoursSinceShipped = Math.floor((now - orderDate) / (1000 * 60 * 60));
                if (hoursSinceShipped <= 24) { // Show for 24 hours
                    notifications.push({
                        id: `shipped-${order._id}`,
                        type: 'info',
                        title: 'Order Shipped',
                        message: `Your order for ${order.product?.name} has been shipped!`,
                        timestamp: orderDate,
                        orderId: order._id,
                        read: false,
                        priority: 'medium'
                    });
                }
            }

            if (order.status === 'Delivered') {
                const hoursSinceDelivered = Math.floor((now - orderDate) / (1000 * 60 * 60));
                if (hoursSinceDelivered <= 24) { // Show for 24 hours
                    notifications.push({
                        id: `delivered-${order._id}`,
                        type: 'success',
                        title: 'Order Delivered',
                        message: `Your order for ${order.product?.name} has been delivered!`,
                        timestamp: orderDate,
                        orderId: order._id,
                        read: false,
                        priority: 'low'
                    });
                }
            }

            // Pending order reminders - show for orders pending more than 2 days
            if (order.status === 'Pending' && daysSinceOrder >= 2) {
                notifications.push({
                    id: `pending-${order._id}`,
                    type: 'warning',
                    title: 'Order Pending',
                    message: `Your order for ${order.product?.name} has been pending for ${daysSinceOrder} days.`,
                    orderId: order._id,
                    read: false,
                    priority: 'medium'
                });
            }

            // Processing notifications
            if (order.status === 'Processing') {
                const hoursSinceProcessing = Math.floor((now - orderDate) / (1000 * 60 * 60));
                if (hoursSinceProcessing <= 12) { // Show for 12 hours
                    notifications.push({
                        id: `processing-${order._id}`,
                        type: 'info',
                        title: 'Order Processing',
                        message: `Your order for ${order.product?.name} is being processed.`,
                        timestamp: orderDate,
                        orderId: order._id,
                        read: false,
                        priority: 'low'
                    });
                }
            }

            // Estimated delivery notifications
            if (order.status === 'Shipped' && order.estimatedDelivery) {
                const estimatedDelivery = new Date(order.estimatedDelivery);
                const daysUntilDelivery = Math.floor((estimatedDelivery - now) / (1000 * 60 * 60 * 24));
                
                if (daysUntilDelivery <= 1 && daysUntilDelivery >= 0) {
                    notifications.push({
                        id: `delivery-reminder-${order._id}`,
                        type: 'info',
                        title: 'Delivery Reminder',
                        message: `Your order for ${order.product?.name} is expected to arrive ${daysUntilDelivery === 0 ? 'today' : 'tomorrow'}!`,
                        timestamp: new Date(),
                        orderId: order._id,
                        read: false,
                        priority: 'medium'
                    });
                }
            }
        });

        // Sort by timestamp (newest first)
        return notifications.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            }
            return 0;
        });
    };

    const handleMarkAsRead = (id) => {
        // Update local state immediately
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );

        // Persist the read state
        const persistedStates = loadPersistedStates();
        persistedStates[id] = { ...persistedStates[id], read: true };
        savePersistedStates(persistedStates);
    };

    const markAllAsRead = () => {
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);

        // Persist all read states
        const persistedStates = loadPersistedStates();
        notifications.forEach(notification => {
            persistedStates[notification.id] = { ...persistedStates[notification.id], read: true };
        });
        savePersistedStates(persistedStates);
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // Add to cleared notifications
        const clearedNotifications = loadClearedNotifications();
        if (!clearedNotifications.includes(id)) {
            clearedNotifications.push(id);
            saveClearedNotifications(clearedNotifications);
        }
    };

    const clearAllNotifications = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            // Add all notification IDs to cleared list
            const clearedNotifications = loadClearedNotifications();
            const allIds = notifications.map(n => n.id);
            const updatedCleared = [...new Set([...clearedNotifications, ...allIds])];
            saveClearedNotifications(updatedCleared);
            
            setNotifications([]);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'error':
                return <FaTimesCircle className="text-red-500" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-500" />;
            case 'info':
                return <FaInfoCircle className="text-blue-500" />;
            default:
                return <FaBell className="text-gray-500" />;
        }
    };

    const getNotificationColor = (type, priority) => {
        if (priority === 'high') return 'border-red-500 bg-red-50';
        if (priority === 'medium') return 'border-yellow-500 bg-yellow-50';
        if (priority === 'low') return 'border-blue-500 bg-blue-50';
        
        switch (type) {
            case 'success':
                return 'border-green-500 bg-green-50';
            case 'error':
                return 'border-red-500 bg-red-50';
            case 'warning':
                return 'border-yellow-500 bg-yellow-50';
            case 'info':
                return 'border-blue-500 bg-blue-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    }).filter(notif => 
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unreadCount = notifications.filter(n => !n.read).length;

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
                        <h1 className="text-3xl font-bold text-gray-900">My Notifications</h1>
                        <p className="text-gray-600 mt-2">Stay updated with your order status and important alerts</p>
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center space-x-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Notifications</option>
                                <option value="unread">Unread Only</option>
                                <option value="read">Read Only</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <span className="text-sm text-gray-600 flex items-center">
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
                        className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getNotificationColor(notification.type, notification.priority)} ${
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
                                        {notification.priority && (
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {notification.priority.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mb-2">{notification.message}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span>{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : 'Just now'}</span>
                                        {notification.orderId && (
                                            <span>Order ID: #{notification.orderId.slice(-8)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {!notification.read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                                    >
                                        <FaEnvelopeOpen className="mr-1" />
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
                         searchTerm ? 'No notifications match your search' :
                         'You\'ll see notifications here when there are updates to your orders'}
                    </p>
                </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                    Notifications update in real-time via WebSocket connection
                </p>
            </div>
        </div>
    );
};

export default EmployeeNotifications;