import express from 'express';

// Removed TypeScript-specific global declaration as it is not valid in JavaScript files.

/**
 * Extend Express Request type to include user property
 */
// Removed TypeScript-specific global declaration as it is not valid in JavaScript files.
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * @typedef {import('../models/user.model.js').IUser} IUser
 */

/**
 * @typedef {Object} AuthRequest
 * @property {IUser} user
 */

/** @typedef {express.Request & AuthRequest} RequestWithUser */

/** @typedef {{ success: boolean, message: string, error?: string }} ApiResponse */

/**
 * Authentication middleware
 * @param {string[]} roles - Allowed roles
 */
const auth = (roles = []) => {
  /** @type {import('express').RequestHandler} */
  const handler = async (req, res, next) => {
    try {
      // Check for token
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        /** @type {ApiResponse} */
        const response = {
          success: false,
          message: 'No authentication token, access denied'
        };
        res.status(401).json(response);
        return;
      }

      // Verify token
      const secret = process.env.JWT_SECRET || '';
      /** @type {any} */
      const decoded = jwt.verify(token, secret);

      // Check user exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        /** @type {ApiResponse} */
        const response = {
          success: false,
          message: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        /** @type {ApiResponse} */
        const response = {
          success: false,
          message: 'Account is deactivated'
        };
        res.status(403).json(response);
        return;
      }

      // Check role authorization
      if (roles.length && !roles.includes(user.role)) {
        /** @type {ApiResponse} */
        const response = {
          success: false,
          message: 'Unauthorized access'
        };
        res.status(403).json(response);
        return;
      }

      // Attach user to request
      /** @type {RequestWithUser} */ (req).user = {
        _id: user._id.toString(),
        // Remove duplicate _id property since it's already defined above
        role: user.role
      };

      next();
    } catch (error) {
      /** @type {ApiResponse} */
      const response = {
        success: false,
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(401).json(response);
    }
  };

  return handler;
};

export const authenticateToken = auth(['user', 'admin', 'registration']);
export const authorizeAdmin = auth(['admin']);

// Export auth as default for backward compatibility
export default auth;
export const authorizeRegistration = auth(['registration']);

