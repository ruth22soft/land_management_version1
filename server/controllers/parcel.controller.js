// @ts-nocheck
import Parcel from '../models/parcel.model.js';
import User from '../models/user.model.js';
import Certificate from '../models/certificate.model.js';

/**
 * Create a new parcel
 */
export const createParcel = async (req, res) => {
  try {
    const {
      parcelNumber,
      location,
      size,
      ownerName,
      landUseType,
      certificateNumber,
      // Get location fields
      region,
      zone,
      woreda,
      kebele,
      block,
      nationalId
    } = req.body;

    console.log('Received parcel creation request:', req.body);

    // Validate that the certificate exists
    const certificate = await Certificate.findOne({ certificateNumber });
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate number not found.',
        error: 'CERTIFICATE_NOT_FOUND'
      });
    }

    // Create the combined location string using English fields
    const locationString = [
      certificate.regionEn || region,
      certificate.zoneEn || zone,
      certificate.woredaEn || woreda,
      certificate.kebeleEn || kebele,
      certificate.block || block
    ].filter(Boolean).join(', ');

    // Create the parcel with all location fields
    const parcel = new Parcel({
      parcelNumber,
      location: locationString,
      size: Number(size),
      ownerName: certificate.firstNameEn && certificate.lastNameEn 
        ? `${certificate.firstNameEn} ${certificate.lastNameEn}`.trim()
        : ownerName,
      nationalId: nationalId || certificate.nationalId,
      landUseType: landUseType || certificate.landUseType,
      certificateNumber,
      // Location fields - use certificate data if available
      region: certificate.regionEn || region,
      zone: certificate.zoneEn || zone,
      woreda: certificate.woredaEn || woreda,
      kebele: certificate.kebeleEn || kebele,
      block: certificate.block || block,
      // Add reference to certificate
      certificate: certificate._id
    });

    console.log('Creating parcel with data:', parcel);

    const savedParcel = await parcel.save();
    console.log('Parcel saved successfully:', savedParcel);

    res.status(201).json({
      success: true,
      data: savedParcel,
      message: 'Parcel created successfully'
    });
  } catch (error) {
    console.error('Error creating parcel:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating parcel', 
      error: error.message,
      details: error.stack
    });
  }
};

/**
 * Get all parcels
 */
export const getAllParcels = async (req, res) => {
  try {
    console.log('Fetching all parcels...');
    const parcels = await Parcel.find()
      .populate('certificate', 'certificateNumber regionEn zoneEn woredaEn kebeleEn block')
      .sort({ createdAt: -1 });

    console.log(`Found ${parcels.length} parcels`);

    // Ensure we're sending an array even if empty
    res.status(200).json({
      success: true,
      data: parcels || [],
      message: `Successfully retrieved ${parcels.length} parcels`
    });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching parcels', 
      error: error.message,
      data: [] // Send empty array on error
    });
  }
};

/**
 * Get a parcel by ID
 */
export const getParcelById = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate('certificate', 'certificateNumber regionEn zoneEn woredaEn kebeleEn block');

    if (!parcel) {
      return res.status(404).json({ 
        success: false,
        message: 'Parcel not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    console.error('Error fetching parcel:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching parcel', 
      error: error.message 
    });
  }
};

/**
 * Update a parcel by ID
 */
export const updateParcel = async (req, res) => {
  try {
    const { certificateNumber } = req.body;

    // Only validate that the certificate exists if a certificate number is provided
    if (certificateNumber) {
      const certificate = await Certificate.findOne({ certificateNumber });
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificate number not found.',
          error: 'CERTIFICATE_NOT_FOUND'
        });
      }
    }

    const updatedParcel = await Parcel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedParcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedParcel,
      message: 'Parcel updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating parcel',
      error: error.message
    });
  }
};

/**
 * Delete a parcel by ID
 */
export const deleteParcel = async (req, res) => {
  try {
    console.log('Attempting to delete parcel with ID:', req.params.id);

    // Check if user has registration role
    if (!req.user || req.user.role !== 'registration') {
      console.log('Authorization failed for user:', req.user);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only users with registration role can delete parcels'
      });
    }

    // First check if parcel exists
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      console.log('Parcel not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Check if parcel is referenced by any other documents
    const hasReferences = await checkParcelReferences(parcel._id);
    if (hasReferences) {
      console.log('Parcel has active references:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel: It is referenced by other documents'
      });
    }

    // Proceed with deletion
    const deletedParcel = await Parcel.findByIdAndDelete(req.params.id);
    console.log('Successfully deleted parcel:', deletedParcel);

    res.status(200).json({
      success: true,
      message: 'Parcel deleted successfully',
      data: deletedParcel
    });
  } catch (error) {
    console.error('Error in deleteParcel:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting parcel',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper function to check if parcel has any references
async function checkParcelReferences(parcelId) {
  try {
    // Add checks for any collections that might reference this parcel
    // For example, check certificates or other related documents
    const certificateCount = await Certificate.countDocuments({ parcel: parcelId });
    return certificateCount > 0;
  } catch (error) {
    console.error('Error checking parcel references:', error);
    return false;
  }
}

export const updateParcelStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const { parcelId } = req.params;
    const userId = req.user.id;

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    parcel.status = status;
    parcel.history.push({
      action: `status_changed_to_${status}`,
      by: userId,
      date: new Date(),
      remarks
    });

    await parcel.save();

    res.json({
      success: true,
      message: 'Parcel status updated successfully',
      data: parcel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating parcel status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const bulkUpdateParcelStatus = async (req, res) => {
  try {
    const { parcelIds, status, remarks } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or empty parcel IDs array'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const historyEntry = {
      action: `status_changed_to_${status}`,
      by: userId,
      date: new Date(),
      remarks
    };

    const result = await Parcel.updateMany(
      { _id: { $in: parcelIds } },
      {
        $set: { status },
        $push: { history: historyEntry }
      }
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} parcels`,
      data: {
        totalProcessed: parcelIds.length,
        updated: result.modifiedCount,
        notFound: parcelIds.length - result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in bulk status update',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getParcelHistory = async (req, res) => {
  try {
    const { parcelId } = req.params;

    const parcel = await Parcel.findById(parcelId)
      .populate('owner', 'username email')
      .populate('history.by', 'username email');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    res.json({
      success: true,
      data: {
        parcel,
        history: parcel.history.sort((a, b) => b.date - a.date)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching parcel history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const searchParcels = async (req, res) => {
  try {
    const { status, owner, location, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (owner) query.owner = owner;
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const totalParcels = await Parcel.countDocuments(query);
    const totalPages = Math.ceil(totalParcels / limit);

    const parcels = await Parcel.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        parcels,
        pagination: {
          currentPage: page,
          totalPages,
          totalParcels,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching parcels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};