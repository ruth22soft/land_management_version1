import express from 'express';
import mongoose from 'mongoose';
import Certificate from '../models/certificate.model.js';
import auth from '../middleware/auth.js';

/**
 * @typedef {Object} MongooseUser
 * @property {mongoose.Types.ObjectId} _id
 * @property {string} role
 */

/**
 * @typedef {Object} CertificateResponse
 * @property {boolean} success
 * @property {any} [data]
 * @property {string} [message]
 * @property {string} [error]
 */

/**
 * @typedef {express.Request & { user: MongooseUser }} AuthRequest
 */

/** @type {express.Router} */

const router = express.Router();

/**
 * @route POST /api/certificates
 * @desc Create a new certificate
 */
router.post('/', auth(['admin', 'registration']), /** 
 * @type {(req: AuthRequest, res: express.Response<CertificateResponse>) => Promise<void>} 
 */ 
async (req, res) => {
  try {
    const { recipientName, courseName, expiryDate, description } = req.body;
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const certificate = new Certificate({
      userId: req.user._id,
      certificateNumber,
      recipientName,
      courseName,
      expiryDate,
      description,
      status: 'active'
    });

    await certificate.save();
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/certificates
 * @desc Get all certificates
 */
router.get('/', auth(['admin', 'registration']), /** 
 * @type {(req: AuthRequest, res: express.Response<CertificateResponse>) => Promise<void>} 
 */ 
async (req, res) => {
  try {
    const query = req.user.role !== 'admin' ? { userId: req.user._id } : {};
    const certificates = await Certificate.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/certificates/:id
 * @desc Get certificate by ID
 */
router.get('/:id', /** 
 * @type {(req: express.Request, res: express.Response<CertificateResponse>) => Promise<void>} 
 */ 
async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route PUT /api/certificates/:id
 * @desc Update certificate
 */
router.put('/:id', auth(['admin', 'registration']), /** 
 * @type {(req: AuthRequest, res: express.Response<CertificateResponse>) => Promise<void>} 
 */ 
async (req, res) => {
  try {
    const { recipientName, courseName, expiryDate, description, status } = req.body;
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (req.user.role !== 'admin' && certificate.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this certificate'
      });
    }

    Object.assign(certificate, {
      recipientName: recipientName || certificate.recipientName,
      courseName: courseName || certificate.courseName,
      expiryDate: expiryDate || certificate.expiryDate,
      description: description || certificate.description,
      status: status || certificate.status
    });

    await certificate.save();
    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;