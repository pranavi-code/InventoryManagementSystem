// auth.js
import express from 'express';
import { login, logout } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // ✅ changed

const router = express.Router();
router.post('/login', login);
router.post('/logout', authMiddleware, logout); // ✅ changed
export default router;
