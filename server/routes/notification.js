import express from 'express';
const router = express.Router();
import {
    createNotification,
    getNotifications,
    markAsRead,
} from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

// Create a new notification
router.post('/', authMiddleware, createNotification);

// Get all notifications for a user
router.get('/:userId', authMiddleware, getNotifications);

// Mark a notification as read
router.put('/:id/read', authMiddleware, markAsRead);

export default router;