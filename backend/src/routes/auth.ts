// Authentication routes
import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /auth/login - Login
router.post('/login', authController.login);

// POST /auth/register - Register
router.post('/register', authController.register);

// GET /auth/me - Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// PUT /auth/profile - Update profile
router.put('/profile', authMiddleware, authController.updateProfile);

// POST /auth/logout - Logout
router.post('/logout', authController.logout);

export default router;
