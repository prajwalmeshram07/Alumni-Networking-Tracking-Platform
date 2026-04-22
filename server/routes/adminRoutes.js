import express from 'express';
import { getStats, getAllUsers, deleteUser, deletePost } from '../controllers/adminController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, adminProtect, getStats);
router.route('/users').get(protect, adminProtect, getAllUsers);
router.route('/users/:id').delete(protect, adminProtect, deleteUser);
router.route('/posts/:id').delete(protect, adminProtect, deletePost);

export default router;
