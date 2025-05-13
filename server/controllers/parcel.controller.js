// @ts-nocheck
import Parcel from '../models/parcel.model.js';
import User from '../models/user.model.js';
//import Certificate from '../models/certificate.model.js';

// Create a new parcel
export const createParcel = async (req, res) => {
  try {
    const {ownerNameAm, ownerNameEn, nationalId, landLocation, landDescription, landSize, sizeUnit, landUseType } = req.body;

    // Validate required fields
    if (!ownerNameAm || !ownerNameEn || !landLocation || !landDescription || !landSize || !landUseType) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    // Create the parcel
    const parcel = new Parcel(req.body);
    const savedParcel = await parcel.save();

    res.status(201).json({ success: true, data: savedParcel });
  } catch (error) {
    console.error("Error creating parcel:", error.message);
    res.status(500).json({ success: false, message: "Error creating parcel", error: error.message });
  }
};
// Get all parcels
export const getAllParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find();
    res.status(200).json({ success: true, data: parcels });
  } catch (error) {
    console.error("Error fetching parcels:", error.message);
    res.status(500).json({ success: false, message: "Error fetching parcels", error: error.message });
  }
};
// Get a parcel by ID
export const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = await Parcel.findById(id);

    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    const ownerNameAm = `${parcel.ownerNameAm.firstName} ${parcel.ownerNameAm.lastName}`;
    const ownerNameEn = `${parcel.ownerNameEn.firstName} ${parcel.ownerNameEn.lastName}`;
    

    res.status(200).json({
       success: true, 
       data: {
        ...parcel.toObject(),
        ownerNameAm, // Add the full name in Amharic
        ownerNameEn, // Add the full name in English
      }, 
      
      });
  } catch (error) {
    console.error("Error fetching parcel:", error.message);
    res.status(500).json({ success: false, message: "Error fetching parcel", error: error.message });
  }
};

// Get a parcel by parcelNumber
export const getParcelByNumber = async (req, res) => {
  try {
    const { parcelNumber } = req.params;
    const parcel = await Parcel.findOne({ parcelNumber });
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }
    res.status(200).json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching parcel by number", error: error.message });
  }
};

// Update a parcel
export const updateParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedParcel = await Parcel.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedParcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    res.status(200).json({ success: true, data: updatedParcel });
  } catch (error) {
    console.error("Error updating parcel:", error.message);
    res.status(500).json({ success: false, message: "Error updating parcel", error: error.message });
  }
};
// Delete a parcel
export const deleteParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedParcel = await Parcel.findByIdAndDelete(id);

    if (!deletedParcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    res.status(200).json({ success: true, message: "Parcel deleted successfully" });
  } catch (error) {
    console.error("Error deleting parcel:", error.message);
    res.status(500).json({ success: false, message: "Error deleting parcel", error: error.message });
  }
};


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

    res.status(200).json({
      success: true,
      message: "Parcel status updated successfully",
      data: parcel,
    });
  } catch (error) {
    console.error("Error updating parcel status:", error.message);
    res.status(500).json({ success: false, message: "Error updating parcel status", error: error.message });
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

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} parcels`,
      data: {
        totalProcessed: parcelIds.length,
        updated: result.modifiedCount,
        notFound: parcelIds.length - result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error in bulk status update:", error.message);
    res.status(500).json({ success: false, message: "Error in bulk status update", error: error.message });
  }
};

export const getParcelHistory = async (req, res) => {
  try {
    const { parcelId } = req.params;

    const parcel = await Parcel.findById(parcelId)
      // .populate('owner', 'username email')
      .populate('history.by', 'username email');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
      // Combine firstName and lastName for Amharic and English owner names
      const ownerNameAm = `${parcel.ownerNameAm.firstName} ${parcel.ownerNameAm.lastName}`;
      const ownerNameEn = `${parcel.ownerNameEn.firstName} ${parcel.ownerNameEn.lastName}`;
  
    res.json({
      success: true,
      data: {
        parcel: {
          ...parcel.toObject(),
          ownerNameAm, // Add the full name in Amharic
          ownerNameEn, // Add the full name in English
        },
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