import express from 'express';
import { addProduct, getProducts, updateProduct, deleteProduct } from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware, addProduct);
router.get('/', authMiddleware, getProducts);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;