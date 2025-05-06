// @ts-nocheck
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';


const secretKey = process.env.JWT_SECRET || 'your_secret_key';

/**
 * User login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secretKey,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Format user response
const formatUserResponse = (user) => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isActive: user.isActive
});

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    
    // Verify admin access
    if (req.user.role !== 'admin') {
      console.log('Access denied: Non-admin user attempted to fetch all users');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    console.log(`Found ${users.length} users`);

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Get a user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Create a new user (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, isActive, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      role,
      isActive,
      password: hashedPassword
    });
    console.log('Hashed password during user creation:', hashedPassword);
    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formatUserResponse(savedUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * Update a user by ID (Admin or Registration Officer)
 */
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email/username is taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or username is already taken'
      });
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    user.isActive = isActive !== undefined ? isActive : user.isActive; // Allow toggling isActive

    // Update password if provided
    // if (password) {
    //   const salt = await bcrypt.genSalt(10);
    //   user.password = await bcrypt.hash(password, salt);
    // }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: formatUserResponse(updatedUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * Delete a user by ID (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use deleteOne() instead of remove()
    await User.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Toggle user status
export const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = status;
    const updatedUser = await user.save();

    res.json({
      success: true,
      data: formatUserResponse(updatedUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    // Check for token in the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    
    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
    console.log('Hashed password during password reset:', hashedPassword);
  }
  catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
  }
};

