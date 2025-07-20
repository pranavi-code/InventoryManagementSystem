import express from 'express';
  import { getAnalytics, updateAnalytics } from '../controllers/analyticsController.js';
  import authMiddleware from '../middlewares/authMiddleware.js';

  const router = express.Router();

  router.get('/', authMiddleware, getAnalytics);
  router.post('/update', authMiddleware, updateAnalytics);

  export default router;