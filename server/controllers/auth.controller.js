// @ts-nocheck
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import config from '../config/config.js';

/**
 * Helper function to format user response
 * @param {import('../models/user.model.js').IUser} user
 * @returns {Object}
 */
const formatUserResponse = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role,
});

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await user.save();
    const token = jwt.sign(
      { 
        id: savedUser._id,
        role: savedUser.role,
        email: savedUser.email
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: formatUserResponse(savedUser),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ 
        success: false,
        message: 'This user was not found.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password.' 
      });
    }

    console.log('User authenticated successfully:', email);
    console.log('Using JWT secret:', config.jwtSecret);

    // Generate JWT token with correct payload
    const token = jwt.sign(
      { 
        id: user._id.toString(), // Ensure id is a string
        role: user.role,
        email: user.email
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Token generated successfully');

    // Send user data without password
    const userData = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };

    console.log('Sending response with user data:', userData);

    res.status(200).json({
      success: true,
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error logging in',
      error: error.message 
    });
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

/**
 * Change password
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};