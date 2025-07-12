import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (!user || !(user.id || user._id)) return;
                const userId = user.id || user._id;
                const response = await api.get(`/notifications/${userId}`);
                // Handle both array and object response
                if (Array.isArray(response.data)) {
                    setNotifications(response.data);
                } else if (Array.isArray(response.data.notifications)) {
                    setNotifications(response.data.notifications);
                } else {
                    setNotifications([]);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(
                notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Notifications</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {notifications.length === 0 ? (
                    <p>No new notifications.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <li
                                key={notification._id}
                                className={`p-4 ${notification.isRead ? 'bg-gray-50' : 'bg-white'}`}
                            >
                                <div className="flex justify-between">
                                    <p>{notification.message}</p>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;