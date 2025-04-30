// @ts-nocheck
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js'; // Use named imports
import { register, login, getCurrentUser } from '../controllers/auth.controller.js';

const router = express.Router();

// Test route to verify API is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth API is working',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/login', login);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 */
router.get('/me', authenticate, authorize(['user', 'admin', 'registration']), getCurrentUser);

export default router;