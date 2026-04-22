import express from 'express';
import { createJob, getJobs } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createJob).get(protect, getJobs);

export default router;
