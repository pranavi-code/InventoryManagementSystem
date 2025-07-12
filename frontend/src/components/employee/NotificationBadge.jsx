import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

/**
 * NotificationBadge Component
 * 
 * Displays a red badge with the count of unread notifications for employees.
 * This component fetches order data and calculates notifications based on:
 * - Recent order status changes (approved, rejected, shipped, delivered)
 * - Pending orders that need attention
 * - Delivery reminders
 * 
 * The badge automatically updates every 30 seconds to show real-time notification count.
 */
const NotificationBadge = () => {
    const [notificationCount, setNotificationCount] = useState(0);
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        // Connect to Socket.IO server
        socketRef.current = io('http://localhost:3000', {
            transports: ['polling', 'websocket'],
            reconnection: true,
        });

        // Register user for real-time notifications
        socketRef.current.emit('register', user.id);

        // Listen for real-time notification events
        socketRef.current.on('notification', (notification) => {
            setNotificationCount((prev) => prev + 1);
        });

        // Fetch initial unread notification count
        fetchUnreadNotificationCount();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
        // eslint-disable-next-line
    }, [user]);

    const fetchUnreadNotificationCount = async () => {
        try {
            const token = localStorage.getItem('pos-token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch notifications for this user
            const response = await axios.get(`http://localhost:3000/api/notifications/${user.id}`, { headers });
            const notifications = response.data || [];
            // Count unread notifications
            const unreadCount = notifications.filter((n) => !n.isRead).length;
            setNotificationCount(unreadCount);
        } catch (error) {
            console.error('Error fetching notification count:', error);
            setNotificationCount(0);
        }
    };

    // Don't render anything if there are no notifications
    if (notificationCount === 0) {
        return null;
    }

    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {notificationCount > 99 ? '99+' : notificationCount}
        </span>
    );
};

export default NotificationBadge;