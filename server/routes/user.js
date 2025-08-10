import express from 'express';
import { getUsers, addUser, updateUser, updatePassword, deleteUser, toggleUserStatus } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', authMiddleware, getUsers);
router.post('/add', authMiddleware, addUser);
router.put('/:id', authMiddleware, updateUser);
router.put('/:id/password', authMiddleware, updatePassword);
router.put('/:id/toggle-status', authMiddleware, toggleUserStatus);
router.delete('/:id', authMiddleware, deleteUser);

export default router;