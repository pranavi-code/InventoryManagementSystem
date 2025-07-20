import express from 'express';
  import { getSales, getTotalSales } from '../controllers/salesController.js';
  import authMiddleware from '../middlewares/authMiddleware.js';

  const router = express.Router();

  router.get('/', authMiddleware, getSales);
  router.get('/total', authMiddleware, getTotalSales);

  export default router;