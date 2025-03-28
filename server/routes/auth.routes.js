import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import authenticateToken from '../middleware/auth.js';
import auth from '../middleware/auth.js';

/** @typedef {import('../models/user.model.js').IUser} IUser */
/** @typedef {import('mongoose').Types.ObjectId} ObjectId */

/**
 * @typedef {Object} RegisterBody
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string} [role]
 */

/**
 * @typedef {Object} LoginBody
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} UserResponse
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} AuthResponseData
 * @property {string} token
 * @property {UserResponse} user
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success
 * @property {AuthResponseData} [data]
 * @property {string} [message]
 * @property {string} [error]
 */

/**
 * @typedef {Object} RequestWithUser
 * @property {mongoose.Document & IUser & { _id: mongoose.Types.ObjectId }} user
 */

/**
 * @typedef {Object} MongooseUser
 * @property {mongoose.Types.ObjectId} _id
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string} role
 */

/**
 * @typedef {express.Request & { user: MongooseUser }} AuthRequest
 */

/**
 * Helper function to format user response
 * @param {MongooseUser} user 
 * @returns {UserResponse}
 */
const formatUserResponse = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role
});

/** @type {express.Router} */
const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', /** @type {express.RequestHandler<{}, AuthResponse, RegisterBody>} */ 
(async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
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
      role
    });

    const savedUser = await user.save();
    const token = jwt.sign(
      { userId: savedUser._id },
      /** @type {string} */ (process.env.JWT_SECRET),
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: formatUserResponse(savedUser)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/login', /** @type {express.RequestHandler<{}, AuthResponse, LoginBody>} */ 
(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      /** @type {string} */ (process.env.JWT_SECRET),
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * @route GET /api/auth/me
 * @desc Get current user
 */
router.get('/me', auth(['user', 'admin', 'registration']), async (req, res) => {
  try {
    // @ts-ignore
    const userData = req.user;

    if (!userData || !userData._id) {
      throw new Error('User not found in request');
    }

    res.json({
      success: true,
      data: {
        token: '',
        user: formatUserResponse(/** @type {MongooseUser} */ (userData))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;