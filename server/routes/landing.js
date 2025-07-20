import express from 'express';
import { getLandingStats } from '../controllers/landingController.js';

const router = express.Router();

router.get('/stats', getLandingStats);

export default router;