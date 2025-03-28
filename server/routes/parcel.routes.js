import express from 'express';
import auth from '../middleware/auth.js';
import Parcel from '../models/parcel.model.js';
import Owner from '../models/owner.model.js';

/** @type {express.Router} */
const router = express.Router();

/** 
 * @typedef {Object} ParcelParams
 * @property {string} id
 */

/** 
 * @typedef {Object} ParcelBody
 * @property {string} parcelNumber
 * @property {Object} location
 * @property {string} location.region
 * @property {string} location.zone
 * @property {string} location.woreda
 * @property {string} location.kebele
 * @property {[number, number]} location.coordinates
 * @property {number} area
 * @property {string} landUse
 * @property {string} owner
 * @property {string} [status]
 * @property {string[]} [documents]
 */

/**
 * @route GET /api/parcels
 * @desc Get all parcels
 * @access Private
 */
router.get('/', auth(['admin', 'registration']), async (req, res) => {
  try {
    /** @type {Array<import('../models/parcel.model.js').IParcel>} */
    const parcels = await Parcel.find()
      .populate('owner', 'firstName lastName idNumber')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: parcels });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching parcels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/parcels/:id
 * @desc Get parcel by ID
 * @access Private
 */
router.get('/:id', 
  auth(['admin', 'registration']), 
  /** @type {express.RequestHandler<ParcelParams>} */
  (async (req, res) => {
    try {
      const parcel = await Parcel.findById(req.params.id)
        .populate('owner', 'firstName lastName idNumber')
        .populate('userId', 'username email');
      if (!parcel) {
        return res.status(404).json({ success: false, message: 'Parcel not found' });
      }
      res.json({ success: true, data: parcel });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching parcel',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

/**
 * @route POST /api/parcels
 * @desc Create new parcel
 * @access Private
 */
router.post('/', 
  auth(['registration']), 
  /** @type {express.RequestHandler<{}, any, ParcelBody>} */
  (async (req, res) => {
    try {
      // Find owner by ID
      const owner = await Owner.findById(req.body.owner);
      if (!owner) {
        return res.status(404).json({ 
          success: false, 
          message: 'Owner not found' 
        });
      }

      const newParcel = new Parcel({
        parcelNumber: req.body.parcelNumber,
        location: {
          region: req.body.location.region,
          zone: req.body.location.zone,
          woreda: req.body.location.woreda,
          kebele: req.body.location.kebele,
          coordinates: req.body.location.coordinates
        },
        area: req.body.area,
        landUse: req.body.landUse,
        owner: req.body.owner,
        userId: owner.userId,
        status: req.body.status || 'pending',
        documents: req.body.documents || []
      });

      const savedParcel = await newParcel.save();
      res.status(201).json({ success: true, data: savedParcel });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error creating parcel',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

/**
 * @route PUT /api/parcels/:id
 * @desc Update parcel
 * @access Private
 */
router.put('/:id', 
  auth(['registration']), 
  /** @type {express.RequestHandler<ParcelParams, any, Partial<ParcelBody>>} */
  (async (req, res) => {
    try {
      // If owner is being updated, verify it exists and get userId
      if (req.body.owner) {
        const owner = await Owner.findById(req.body.owner);
        if (!owner) {
          return res.status(404).json({ 
            success: false, 
            message: 'Owner not found' 
          });
        }
        // Add userId to the update
        const updateData = { ...req.body, userId: owner.userId };
        req.body = updateData;
      }

      const updatedParcel = await Parcel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedParcel) {
        return res.status(404).json({ success: false, message: 'Parcel not found' });
      }

      res.json({ success: true, data: updatedParcel });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error updating parcel',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

/**
 * @route DELETE /api/parcels/:id
 * @desc Delete parcel
 * @access Private
 */
router.delete('/:id', 
  auth(['admin']), 
  /** @type {express.RequestHandler<ParcelParams>} */
  (async (req, res) => {
    try {
      const parcel = await Parcel.findByIdAndDelete(req.params.id);
      
      if (!parcel) {
        return res.status(404).json({ success: false, message: 'Parcel not found' });
      }

      res.json({ success: true, message: 'Parcel deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting parcel',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

/**
 * @route GET /api/parcels/search
 * @desc Search parcels
 * @access Private
 */
router.get('/search', auth(['admin', 'registration']), async (req, res) => {
  try {
    const { parcelNumber, region, zone, woreda, kebele } = req.query;
    
    /** @type {Record<string, RegExp>} */
    const query = {};
    if (parcelNumber) query.parcelNumber = new RegExp(String(parcelNumber), 'i');
    if (region) query['location.region'] = new RegExp(String(region), 'i');
    if (zone) query['location.zone'] = new RegExp(String(zone), 'i');
    if (woreda) query['location.woreda'] = new RegExp(String(woreda), 'i');
    if (kebele) query['location.kebele'] = new RegExp(String(kebele), 'i');

    /** @type {Array<import('../models/parcel.model.js').IParcel>} */
    const parcels = await Parcel.find(query)
      .populate('owner', 'firstName lastName idNumber')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: parcels });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error searching parcels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;