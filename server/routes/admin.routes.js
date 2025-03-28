import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import {
  getSystemStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getActivityLogs,
  getDashboardMetrics,
  getUserAuditTrail,
  getSystemHealth
} from '../controllers/admin.controller.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken, authorizeAdmin);

// System Statistics and Metrics
router.get('/stats', getSystemStats);
router.get('/metrics', getDashboardMetrics);
router.get('/health', getSystemHealth);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Activity Monitoring
router.get('/activity', getActivityLogs);
router.get('/users/:id/audit', getUserAuditTrail);

export default router;