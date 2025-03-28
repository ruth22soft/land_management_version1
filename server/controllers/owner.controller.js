import User from '../models/user.model.js';
import Owner from '../models/owner.model.js';
import Parcel from '../models/parcel.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @route GET /api/owners
 * @desc Get all landowners
 * @access Private (admin, registration)
 */
export const getAllOwners = async (req, res) => {
  try {
    const owners = await Owner.find()
      .populate('userId', 'username email role -_id')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: owners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching landowners',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @route POST /api/owners/register
 * @desc Register a new landowner
 * @access Public
 */
export const registerOwner = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password,
      firstName,
      lastName,
      firstNameAm,
      lastNameAm,
      idNumber,
      phone,
      address,
      addressAm
    } = req.body;

    // Input validation
    if (!username || !email || !password || !firstName || !lastName || !idNumber || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Check if owner with same ID number exists
    const existingOwner = await Owner.findOne({ idNumber });
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'Owner with this ID number already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with 'user' role
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    // Create owner profile linked to user
    const owner = new Owner({
      userId: user._id,
      firstName,
      lastName,
      firstNameAm: firstNameAm || '',
      lastNameAm: lastNameAm || '',
      idNumber,
      phone,
      address,
      addressAm: addressAm || ''
    });

    await owner.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      /** @type {string} */ (process.env.JWT_SECRET),
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Landowner registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        owner: {
          firstName: owner.firstName,
          lastName: owner.lastName,
          idNumber: owner.idNumber,
          phone: owner.phone,
          address: owner.address
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering landowner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @route GET /api/owners/profile
 * @desc Get landowner profile
 * @access Private (user)
 */
export const getOwnerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const owner = await Owner.findOne({ userId: user._id });
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner profile not found'
      });
    }

    const parcels = await Parcel.find({ owner: user._id });

    res.json({
      success: true,
      data: {
        user,
        owner,
        parcels
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @route PUT /api/owners/profile
 * @desc Update landowner profile
 * @access Private (user)
 */
export const updateOwnerProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      firstNameAm,
      lastNameAm,
      phone,
      address,
      addressAm
    } = req.body;

    const owner = await Owner.findOne({ userId: req.user._id });
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner profile not found'
      });
    }

    // Update owner fields
    if (firstName) owner.firstName = firstName;
    if (lastName) owner.lastName = lastName;
    if (firstNameAm) owner.firstNameAm = firstNameAm;
    if (lastNameAm) owner.lastNameAm = lastNameAm;
    if (phone) owner.phone = phone;
    if (address) owner.address = address;
    if (addressAm) owner.addressAm = addressAm;

    await owner.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @route GET /api/owners/:id
 * @desc Get owner by ID
 * @access Private (admin, registration)
 */
export const getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id)
      .populate('userId', 'username email role');
      
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const parcels = await Parcel.find({ owner: owner.userId });

    res.json({
      success: true,
      data: {
        owner,
        parcels
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @route DELETE /api/owners/:id
 * @desc Delete owner
 * @access Private (admin)
 */
export const deleteOwner = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    // Check if owner has parcels
    const parcels = await Parcel.find({ owner: owner.userId });
    if (parcels.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete owner with registered parcels'
      });
    }

    // Delete owner and associated user
    await Owner.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(owner.userId);

    res.json({
      success: true,
      message: 'Owner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};