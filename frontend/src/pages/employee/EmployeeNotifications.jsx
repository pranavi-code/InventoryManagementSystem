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
                return <FaCheckCircle className="text-green-600 text-xl" />;
            case 'error':
                return <FaTimesCircle className="text-red-600 text-xl" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-600 text-xl" />;
            case 'info':
                return <FaInfoCircle className="text-blue-600 text-xl" />;
            default:
                return <FaBell className="text-gray-600 text-xl" />;
        }
    };

    const getNotificationGradient = (type) => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-br from-green-100 to-emerald-100';
            case 'error':
                return 'bg-gradient-to-br from-red-100 to-pink-100';
            case 'warning':
                return 'bg-gradient-to-br from-yellow-100 to-orange-100';
            case 'info':
                return 'bg-gradient-to-br from-blue-100 to-indigo-100';
            default:
                return 'bg-gradient-to-br from-gray-100 to-slate-100';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/10 to-blue-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
            
            <div className="relative z-10 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="backdrop-blur-lg bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                                    My Notifications
                                </h1>
                                <p className="text-gray-600 text-lg">Stay updated with your order status and important alerts</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {unreadCount > 0 && (
                                    <div className="relative">
                                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-white/20 backdrop-blur-sm">
                                            {unreadCount} unread
                                        </span>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                                    </div>
                                )}
                                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/30">
                                    <FaBell className="text-2xl text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-4 backdrop-blur-sm border border-white/30">
                                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                                    <FaFilter className="text-blue-600" />
                                </div>
                                <select
                                    className="bg-transparent border-0 outline-none text-gray-700 font-medium cursor-pointer"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all">All Notifications</option>
                                    <option value="unread">Unread Only</option>
                                    <option value="read">Read Only</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-2xl p-4 backdrop-blur-sm border border-white/30">
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    className="bg-transparent border-0 outline-none placeholder-gray-500 text-gray-700 w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/30">
                                <span className="text-sm text-gray-600 font-medium">
                                    Showing {filteredNotifications.length} notifications
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-lg backdrop-blur-sm border border-white/20 font-medium"
                                >
                                    <FaMarkdown className="mr-2" />
                                    Mark All Read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center shadow-lg backdrop-blur-sm border border-white/20 font-medium"
                                >
                                    <FaTrash className="mr-2" />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-6">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`backdrop-blur-lg bg-white/60 rounded-3xl p-6 shadow-xl border border-white/20 transition-all duration-300 hover:shadow-2xl hover:bg-white/70 ${
                                !notification.read ? 'ring-2 ring-blue-300/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30 ${getNotificationGradient(notification.type)}`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="font-bold text-gray-900 text-lg">{notification.title}</h3>
                                            {!notification.read && (
                                                <div className="relative">
                                                    <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg"></span>
                                                    <span className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping"></span>
                                                </div>
                                            )}
                                            {notification.priority && (
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-sm border border-white/30 ${
                                                    notification.priority === 'high' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800' :
                                                    notification.priority === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                                                    'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
                                                }`}>
                                                    {notification.priority.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 mb-3 leading-relaxed">{notification.message}</p>
                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <FaClock className="text-gray-400" />
                                                <span>{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : 'Just now'}</span>
                                            </div>
                                            {notification.orderId && (
                                                <div className="flex items-center space-x-2">
                                                    <FaTruck className="text-gray-400" />
                                                    <span>Order #{notification.orderId.slice(-8)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 rounded-xl hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300 text-sm font-medium flex items-center backdrop-blur-sm border border-white/30"
                                        >
                                            <FaEnvelopeOpen className="mr-2" />
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-600 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
                                    >
                                        <FaTrash className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredNotifications.length === 0 && (
                    <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-12 shadow-xl border border-white/20 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                            <FaBell className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-3">No notifications found</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {filter === 'unread' ? 'All notifications have been read' : 
                             filter === 'read' ? 'No read notifications' : 
                             searchTerm ? 'No notifications match your search' :
                             'You\'ll see notifications here when there are updates to your orders'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeNotifications;