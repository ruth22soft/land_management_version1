import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
/**
 * @typedef {Object} IUser
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {Boolean} isActive
 * @property {string} password
 * @property {('admin'|'registration'|'user')} role
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  lastName: {
    type: String,
    required: true,
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
  phone: {
    type: String,
    required: true 
  },
  role: {
    type: String,
    enum: ['admin', 'registration', 'user'],
    default: 'registration'
  },
  isActive: {
    type: Boolean,
    default: true 
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  
}, {
  timestamps: true
});

// Add indexes for better search performance
// userSchema.index({ username: 1, email: 1, role: 1 });
// Hash the password before saving
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

/** @type {mongoose.Model<IUser>} */
const User = mongoose.model('User', userSchema);

export default User;