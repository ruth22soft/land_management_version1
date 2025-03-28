import mongoose from 'mongoose';

/**
 * @typedef {Object} IUser
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {('admin'|'registration'|'user')} role
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'registration', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for better search performance
userSchema.index({ username: 1, email: 1, role: 1 });

/** @type {mongoose.Model<IUser>} */
const User = mongoose.model('User', userSchema);

export default User;