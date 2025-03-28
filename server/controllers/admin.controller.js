import User from '../models/user.model.js';
import Parcel from '../models/parcel.model.js';
import Certificate from '../models/certificate.model.js';

/**
 * Get detailed dashboard metrics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    const metrics = {
      userMetrics: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isActive: true }),
        registrationOffices: await User.countDocuments({ role: 'registration' })
      },
      parcelMetrics: {
        total: await Parcel.countDocuments(),
        approved: await Parcel.countDocuments({ status: 'approved' }),
        pending: await Parcel.countDocuments({ status: 'pending' }),
        rejected: await Parcel.countDocuments({ status: 'rejected' })
      },
      certificateMetrics: {
        total: await Certificate.countDocuments(),
        issuedLastMonth: await Certificate.countDocuments({
          createdAt: { $gte: lastMonth }
        })
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get system statistics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getSystemStats = async (req, res) => {
  try {
    // Implement system statistics logic
    res.json({
      success: true,
      data: {
        // Sample stats
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all users
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update user status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update user role
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get activity logs
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getActivityLogs = async (req, res) => {
  try {
    // Implement activity logs logic
    res.json({
      success: true,
      data: [
        // Sample activity logs
        {
          id: 1,
          action: 'User login',
          userId: 'user123',
          timestamp: new Date()
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user audit trail
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getUserAuditTrail = async (req, res) => {
  try {
    const { id } = req.params;
    // Implement user audit trail logic
    res.json({
      success: true,
      data: [
        // Sample audit trail
        {
          id: 1,
          action: 'Profile updated',
          timestamp: new Date()
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user audit trail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get system health
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getSystemHealth = async (req, res) => {
  try {
    // Implement system health check logic
    res.json({
      success: true,
      data: {
        database: 'healthy',
        server: 'healthy',
        services: {
          authentication: 'healthy',
          storage: 'healthy'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking system health',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};