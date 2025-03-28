import Parcel from '../models/parcel.model.js';
import User from '../models/user.model.js';

export const createParcel = async (req, res) => {
  try {
    const { location, area, boundaries, documents } = req.body;
    const userId = req.user.id;

    const existingParcel = await Parcel.findOne({
      location,
      'boundaries.coordinates': boundaries.coordinates
    });

    if (existingParcel) {
      return res.status(400).json({
        success: false,
        message: 'A parcel with these coordinates already exists'
      });
    }

    const parcel = new Parcel({
      owner: userId,
      location,
      area,
      boundaries,
      documents,
      status: 'pending',
      history: [{
        action: 'created',
        by: userId,
        date: new Date()
      }]
    });

    await parcel.save();

    res.status(201).json({
      success: true,
      message: 'Parcel created successfully',
      data: parcel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating parcel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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