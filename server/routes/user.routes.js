// @ts-nocheck

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword
} from '../controllers/user.controller.js';

const router = express.Router();

// Protect all routes with authentication and admin authorization
router.use(authenticate, authorize(['admin']));

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Create new user
router.post('/', createUser);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

//reset password
router.post('/:id/reset-password', resetPassword);

// Toggle user status
router.patch('/:id/status', toggleUserStatus);

export default router;