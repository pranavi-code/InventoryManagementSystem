import express from 'express';
import { getUsers, addUser, updateUser, updatePassword, deleteUser } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', authMiddleware, getUsers);
router.post('/add', authMiddleware, addUser);
router.put('/:id', authMiddleware, updateUser);
router.put('/:id/password', authMiddleware, updatePassword);
router.delete('/:id', authMiddleware, deleteUser);

export default router;