import mongoose from 'mongoose';

/**
 * @typedef {Object} ICertificate
 * @property {mongoose.Types.ObjectId} userId - User who created the certificate
 * @property {string} certificateNumber - Unique certificate number
 * @property {string} recipientName - Name of the recipient
 * @property {string} courseName - Name of the course
 * @property {Date} issueDate - Date when certificate was issued
 * @property {Date} expiryDate - Date when certificate expires (optional)
 * @property {('pending'|'active'|'expired'|'revoked')} status - Status of the certificate
 * @property {string} [description] - Optional description
 * @property {Object} [additionalFields] - Any additional custom fields
 * @property {Date} createdAt - Date when record was created
 * @property {Date} updatedAt - Date when record was last updated
 */

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'revoked'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  },
  additionalFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Create index for faster queries
certificateSchema.index({ certificateNumber: 1 }); // Keep this as a unique index
certificateSchema.index({ userId: 1, status: 1 }); // Combine user and status indexes

/** @type {typeof mongoose.Model} */
const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;