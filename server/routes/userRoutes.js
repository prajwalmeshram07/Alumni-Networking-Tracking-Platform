import express from 'express';
import { followUser, getConnections, getAllUsers, updateProfile, getProfile, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/connections', protect, getConnections);
router.get('/:id', protect, getUserById);
router.put('/:id/follow', protect, followUser);
router.get('/', protect, getAllUsers);

export default router;
