import express from 'express';
import {
    addOrder,
    getOrders,
    getOrdersByStatus,
    updateOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    getOrderStats,
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Order management routes
router.post('/add', authMiddleware, addOrder);
router.get('/', authMiddleware, getOrders);
router.get('/stats', authMiddleware, getOrderStats);
router.get('/status/:status', authMiddleware, getOrdersByStatus);
router.put('/:id', authMiddleware, updateOrder);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.put('/:id/cancel', authMiddleware, cancelOrder);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;