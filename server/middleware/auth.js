// @ts-nocheck
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import config from '../config/config.js';

// Middleware to verify token and user role
export const authenticate = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Request path:', req.path);
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // Improved token validation
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid authorization format:', authHeader);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format. Use Bearer token.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token found after Bearer');
      return res.status(401).json({ 
        success: false,
        message: 'No token provided after Bearer.' 
      });
    }

    console.log('Using JWT secret:', config.jwtSecret);
    
    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('Token decoded successfully:', decoded);
    
    if (!decoded.id) {
      console.log('Invalid token payload - no id found:', decoded);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload.' 
      });
    }

    // Check if the user exists in the database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for id:', decoded.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    console.log('User found:', { id: user._id, role: user.role });

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is deactivated:', decoded.id);
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.' 
      });
    }

    // Attach user and token info to request object
    req.user = user;
    req.token = token;
    console.log('Authentication successful, proceeding to next middleware');
    next();

  } catch (error) {
    console.error('Authentication error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please log in again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Please log in again.' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Middleware to authorize based on roles
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized. Please log in.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.` 
      });
    }

    next();
  };
};

