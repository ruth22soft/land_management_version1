import express from 'express';
import {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  verifyCertificate
} from '../controllers/certificate.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Create a new certificate (Registration role)
router.post(
  '/',
  authenticate,
  authorize(['registration']),
  upload.fields([
    { name: 'landPhoto', maxCount: 1 },
    { name: 'boundaryPhoto', maxCount: 1 },
    { name: 'ownerPhoto', maxCount: 1 },
    { name: 'landPlanImage', maxCount: 1 }
  ]),
  createCertificate
);

// Get all certificates (Registration role)
router.get(
  '/',
  authenticate,
  authorize(['registration']),
  getAllCertificates
);

// Verify certificate (Public)
router.get(
  '/verify/:certificateNumber',
  verifyCertificate
);

// Get certificate by ID (Registration role)
router.get(
  '/:id',
  authenticate,
  authorize(['registration']),
  getCertificateById
);

// Update certificate (Registration role)
router.put(
  '/:id',
  authenticate,
  authorize(['registration']),
  upload.array('documents', 4),
  updateCertificate
);

// Delete certificate (Registration role)
router.delete(
  '/:id',
  authenticate,
  authorize(['registration']),
  deleteCertificate
);

export default router;