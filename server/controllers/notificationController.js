import Notification from '../models/Notification.js';

// Create a new notification
export const createNotification = async (req, res) => {
    try {
        // Only allow admins to create notifications
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can send notifications' });
        }
        const { recipient, sender, type, message } = req.body;
        const notification = new Notification({
            recipient,
            sender,
            type,
            message,
        });
        await notification.save();

        // Real-time notification via Socket.IO
        const io = req.app.get('io');
        const userSocketMap = req.app.get('userSocketMap');
        const recipientSocketId = userSocketMap.get(String(recipient));
        if (io && recipientSocketId) {
            console.log('[Socket.IO] Emitting notification to', recipientSocketId, notification);
            io.to(recipientSocketId).emit('notification', notification);
        } else {
            console.log('[Socket.IO] No recipient socket found for', recipient);
        }

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
};

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId })
            .populate('sender', 'name')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};