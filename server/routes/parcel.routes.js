import express from 'express';
import {
  createParcel,
  getAllParcels,
  getParcelById,
  getParcelByNumber,
  updateParcel,
  deleteParcel,
  updateParcelStatus,
  bulkUpdateParcelStatus,
} from '../controllers/parcel.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import Certificate from '../models/certificate.model.js';
import Parcel from '../models/parcel.model.js';

const router = express.Router();

// // Create a new parcel (Admin or Registration role)
// router.post('/', authenticate, authorize(['admin', 'registration']), createParcel);

// // Get all parcels (Admin or Registration role)
// router.get('/', authenticate, authorize(['admin', 'registration']), getAllParcels);

// // Get a parcel by ID (Admin or Registration role)
// router.get('/:id', authenticate, authorize(['admin', 'registration']), getParcelById);

// // Update a parcel by ID (Admin or Registration role)
// router.put('/:id', authenticate, authorize(['admin', 'registration']), updateParcel);

// // Delete a parcel by ID (Admin or Registration role)
// router.delete('/:id', authenticate, authorize(['admin', 'registration']), deleteParcel);

// Create a new parcel
router.post("/", createParcel);

// Get all parcels
router.get("/", getAllParcels);

// Get a parcel by ID
router.get("/:id", getParcelById);

// Get a parcel by parcelNumber
router.get("/number/:parcelNumber", getParcelByNumber);

// Update a parcel
router.put("/:id", updateParcel);

// Delete a parcel
router.delete("/:id", deleteParcel);

// Update parcel status
router.put("/:parcelId/status", updateParcelStatus);

// Bulk update parcel statuses
router.put("/bulk/status", bulkUpdateParcelStatus);

// Get pending registrations (parcels with 'Pending' status)
router.get('/pending', authenticate, authorize(['registration']), async (req, res) => {
  try {
    // Find parcels with 'Pending' status
    const pendingParcels = await Parcel.find({
      status: 'Pending'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingParcels
    });
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending registrations',
      error: error.message
    });
  }
});

export default router;