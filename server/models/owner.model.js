import mongoose from 'mongoose';

/**
 * @typedef {Object} IOwner
 * @property {mongoose.Types.ObjectId} userId - Reference to the User model
 * @property {string} firstName - First name in English
 * @property {string} lastName - Last name in English
 * @property {string} firstNameAm - First name in Amharic
 * @property {string} lastNameAm - Last name in Amharic
 * @property {string} idNumber - National ID number
 * @property {string} phone - Contact phone number
 * @property {string} address - Address in English
 * @property {string} addressAm - Address in Amharic
 * @property {string} [photo] - Path to owner's photo
 * @property {string} [signature] - Path to owner's signature
 * @property {Date} createdAt - Date when the record was created
 * @property {Date} updatedAt - Date when the record was last updated
 */

const ownerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true 
  },
  firstNameAm: { 
    type: String,
    trim: true 
  },
  lastNameAm: { 
    type: String,
    trim: true 
  },
  idNumber: { 
    type: String,
    required: true,
    unique: true,
    trim: true 
  },
  phone: { 
    type: String,
    required: true,
    trim: true 
  },
  address: { 
    type: String,
    required: true,
    trim: true 
  },
  addressAm: { 
    type: String,
    trim: true 
  },
  photo: {
    type: String,
    trim: true
  },
  signature: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes for better search performance
ownerSchema.index({ firstName: 1, lastName: 1 }); // Keep name index as is for name searches
ownerSchema.index({ idNumber: 1, phone: 1 }); // Combine idNumber and phone indexes

/**
 * Owner Model
 * @type {mongoose.Model<IOwner>}
 */
const Owner = mongoose.model('Owner', ownerSchema);

export default Owner;