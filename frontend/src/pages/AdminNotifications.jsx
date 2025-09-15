import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
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
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaEnvelopeOpen,
    FaClock
} from 'react-icons/fa';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const socketRef = useRef(null);

    // Load persisted notification states from localStorage
    const loadPersistedStates = () => {
        try {
            const persisted = localStorage.getItem('adminNotificationStates');
            return persisted ? JSON.parse(persisted) : {};
        } catch (error) {
            console.error('Error loading persisted states:', error);
            return {};
        }
    };

    // Save notification states to localStorage
    const savePersistedStates = (states) => {
        try {
            localStorage.setItem('adminNotificationStates', JSON.stringify(states));
        } catch (error) {
            console.error('Error saving persisted states:', error);
        }
    };

    // Load cleared notifications from localStorage
    const loadClearedNotifications = () => {
        try {
            const cleared = localStorage.getItem('adminClearedNotifications');
            return cleared ? JSON.parse(cleared) : [];
        } catch (error) {
            console.error('Error loading cleared notifications:', error);
            return [];
        }
    };

    // Save cleared notifications to localStorage
    const saveClearedNotifications = (clearedIds) => {
        try {
            localStorage.setItem('adminClearedNotifications', JSON.stringify(clearedIds));
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
    }, []);

    const setupSocketConnection = () => {
        socketRef.current = io('http://localhost:3000');
        
        socketRef.current.on('notification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
        });

        socketRef.current.on('order_status_update', () => {
            fetchNotifications();
        });

        socketRef.current.on('stock_update', () => {
            fetchNotifications();
        });
    };

        const fetchNotifications = async () => {
            try {
                if (!user || !(user.id || user._id)) return;
                const userId = user.id || user._id;
            const response = await API.get(`/notifications/${userId}`);
            
            let notificationsData = [];
                if (Array.isArray(response.data)) {
                notificationsData = response.data;
                } else if (Array.isArray(response.data.notifications)) {
                notificationsData = response.data.notifications;
            }

            // Generate system notifications for admin
            const systemNotifications = await generateSystemNotifications();
            const allNotifications = [...systemNotifications, ...notificationsData];
            
            // Apply persisted states
            const persistedStates = loadPersistedStates();
            const clearedNotifications = loadClearedNotifications();
            
            const processedNotifications = allNotifications
                .filter(notification => !clearedNotifications.includes(notification._id))
                .map(notification => ({
                    ...notification,
                    isRead: persistedStates[notification._id]?.isRead ?? notification.isRead
                }));
            
            setNotifications(processedNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSystemNotifications = async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                API.get('/order'),
                API.get('/product')
            ]);

            const orders = ordersRes.data.orders || [];
            const products = productsRes.data.products || [];
            const notifications = [];

            // Low stock notifications
            products.forEach(product => {
                if (product.quantity <= 10 && product.quantity > 0) {
                    notifications.push({
                        _id: `low-stock-${product._id}`,
                        type: 'low_stock',
                        message: `Low stock alert: ${product.name} has only ${product.quantity} units remaining`,
                        isRead: false,
                        createdAt: new Date(),
                        priority: 'high',
                        productId: product._id
                    });
                } else if (product.quantity === 0) {
                    notifications.push({
                        _id: `out-of-stock-${product._id}`,
                        type: 'out_of_stock',
                        message: `Out of stock: ${product.name} is completely out of stock`,
                        isRead: false,
                        createdAt: new Date(),
                        priority: 'urgent',
                        productId: product._id
                    });
                }
            });

            // Pending orders notifications
            const pendingOrders = orders.filter(order => order.status === 'Pending');
            if (pendingOrders.length > 0) {
                notifications.push({
                    _id: 'pending-orders',
                    type: 'pending_orders',
                    message: `${pendingOrders.length} order(s) pending approval`,
                    isRead: false,
                    createdAt: new Date(),
                    priority: 'medium',
                    orderCount: pendingOrders.length
                });
            }

            // Recent orders summary
            const today = new Date();
            const last24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            const recentOrders = orders.filter(order => 
                new Date(order.orderDate) >= last24Hours
            );

            if (recentOrders.length > 0) {
                notifications.push({
                    _id: 'recent-orders',
                    type: 'recent_orders',
                    message: `${recentOrders.length} new order(s) in the last 24 hours`,
                    isRead: false,
                    createdAt: new Date(),
                    priority: 'low',
                    orderCount: recentOrders.length
                });
            }

            return notifications;
        } catch (error) {
            console.error('Error generating system notifications:', error);
            return [];
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            // Update local state immediately
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );

            // Persist the read state
            const persistedStates = loadPersistedStates();
            persistedStates[id] = { ...persistedStates[id], isRead: true };
            savePersistedStates(persistedStates);

            // For system notifications, just mark locally
            if (id.startsWith('low-stock-') || id.startsWith('out-of-stock-') || 
                id.startsWith('pending-orders') || id.startsWith('recent-orders')) {
                return;
            }

            // For real notifications, update in database
            await API.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = () => {
        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updatedNotifications);

        // Persist all read states
        const persistedStates = loadPersistedStates();
        notifications.forEach(notification => {
            persistedStates[notification._id] = { ...persistedStates[notification._id], isRead: true };
        });
        savePersistedStates(persistedStates);
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n._id !== id));
        
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
            const allIds = notifications.map(n => n._id);
            const updatedCleared = [...new Set([...clearedNotifications, ...allIds])];
            saveClearedNotifications(updatedCleared);
            
            setNotifications([]);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'low_stock':
            case 'out_of_stock':
                return <FaExclamationTriangle className="text-red-500" />;
            case 'pending_orders':
                return <FaClock className="text-yellow-500" />;
            case 'recent_orders':
                return <FaInfoCircle className="text-blue-500" />;
            case 'order_status_update':
                return <FaTruck className="text-purple-500" />;
            default:
                return <FaBell className="text-gray-500" />;
        }
    };

    const getNotificationColor = (type, priority) => {
        if (priority === 'urgent') return 'border-red-500 bg-red-50';
        if (priority === 'high') return 'border-orange-500 bg-orange-50';
        if (priority === 'medium') return 'border-yellow-500 bg-yellow-50';
        if (priority === 'low') return 'border-blue-500 bg-blue-50';
        
        switch (type) {
            case 'low_stock':
            case 'out_of_stock':
                return 'border-red-500 bg-red-50';
            case 'pending_orders':
                return 'border-yellow-500 bg-yellow-50';
            case 'recent_orders':
                return 'border-blue-500 bg-blue-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesFilter = filter === 'all' || 
            (filter === 'unread' && !notification.isRead) ||
            (filter === 'read' && notification.isRead);
        
        const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesFilter && matchesSearch;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-2xl text-gray-600 font-semibold">Loading notifications...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="relative mb-8 animate-fadeInDown">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Admin Notifications
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Monitor system alerts, order updates, and inventory status
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {unreadCount > 0 && (
                                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-2xl text-lg font-bold shadow-lg">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 animate-fadeInUp">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex items-center space-x-3">
                            <FaFilter className="text-gray-500 text-xl" />
                            <select
                                className="border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Notifications</option>
                                <option value="unread">Unread Only</option>
                                <option value="read">Read Only</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                className="border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <span className="text-lg text-gray-600 flex items-center font-medium">
                            Showing {filteredNotifications.length} notifications
                        </span>
                    </div>

                    <div className="flex space-x-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                            >
                                <FaMarkdown className="mr-2" />
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                            >
                                <FaTrash className="mr-2" />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="relative space-y-6 animate-fadeInUp">
                {filteredNotifications.map((notification, index) => (
                    <div
                        key={notification._id}
                        className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 transition-all duration-500 hover:scale-105 hover:shadow-3xl ${
                            !notification.isRead ? 'ring-4 ring-violet-200/50' : ''
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {notification.type === 'low_stock' ? 'Low Stock Alert' :
                                             notification.type === 'out_of_stock' ? 'Out of Stock Alert' :
                                             notification.type === 'pending_orders' ? 'Pending Orders' :
                                             notification.type === 'recent_orders' ? 'Recent Orders' :
                                             'Notification'}
                                        </h3>
                                        {!notification.isRead && (
                                            <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full shadow-lg"></span>
                                        )}
                                        {notification.priority && (
                                            <span className={`px-3 py-1 text-sm font-bold rounded-xl backdrop-blur-lg border-2 ${
                                                notification.priority === 'urgent' ? 'bg-red-100/80 text-red-800 border-red-200' :
                                                notification.priority === 'high' ? 'bg-orange-100/80 text-orange-800 border-orange-200' :
                                                notification.priority === 'medium' ? 'bg-yellow-100/80 text-yellow-800 border-yellow-200' :
                                                'bg-blue-100/80 text-blue-800 border-blue-200'
                                            }`}>
                                                {notification.priority.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mb-4 text-lg leading-relaxed">{notification.message}</p>
                                    <div className="flex items-center space-x-6 text-sm text-gray-600 bg-gray-50/80 rounded-2xl p-3">
                                        <span className="font-medium">{new Date(notification.createdAt).toLocaleString()}</span>
                                        {notification.productId && (
                                            <span className="font-medium">Product ID: #{notification.productId.slice(-8)}</span>
                                        )}
                                        {notification.orderCount && (
                                            <span className="font-medium">{notification.orderCount} order(s)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification._id)}
                                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center px-4 py-2 bg-blue-50/80 rounded-xl transition-all duration-200 hover:scale-105"
                                    >
                                        <FaEnvelopeOpen className="mr-2" />
                                        Mark as read
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification._id)}
                                    className="text-red-600 hover:text-red-800 p-3 bg-red-50/80 rounded-xl transition-all duration-200 hover:scale-110"
                                >
                                    <FaTrash className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredNotifications.length === 0 && (
                <div className="relative text-center py-16 animate-fadeInUp">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md mx-auto">
                        <div className="w-24 h-24 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <FaBell className="text-4xl text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No notifications found</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {filter === 'unread' ? 'All notifications have been read' : 
                             filter === 'read' ? 'No read notifications' : 
                             searchTerm ? 'No notifications match your search' :
                             'You\'ll see notifications here when there are system alerts or updates'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;