import express from 'express';
import {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport,
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Generate a new report (Admin only)
router.post('/generate', authenticate, authorize(['admin']), generateReport);

// Get all reports (Admin only)
router.get('/', authenticate, authorize(['admin']), getAllReports);

// Get a report by ID (Admin only)
router.get('/:id', authenticate, authorize(['admin']), getReportById);

// Delete a report by ID (Admin only)
router.delete('/:id', authenticate, authorize(['admin']), deleteReport);

export default router;