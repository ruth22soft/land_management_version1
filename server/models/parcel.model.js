import mongoose from 'mongoose';

/**
 * @typedef {Object} IParcelLocation
 * @property {string} region
 * @property {string} zone
 * @property {string} woreda
 * @property {string} kebele
 * @property {[number, number]} coordinates
 */

/**
 * @typedef {Object} IParcel
 * @property {string} parcelNumber
 * @property {IParcelLocation} location
 * @property {number} area
 * @property {('residential'|'agricultural'|'commercial'|'industrial'|'other')} landUse
 * @property {mongoose.Types.ObjectId} owner - Reference to Owner model
 * @property {mongoose.Types.ObjectId} userId - Reference to User model
 * @property {('pending'|'approved'|'rejected')} status
 * @property {string[]} documents
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @type {mongoose.Schema<IParcel>}
 */
const parcelSchema = new mongoose.Schema({
  parcelNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    region: {
      type: String,
      required: true,
      trim: true
    },
    zone: {
      type: String,
      required: true,
      trim: true
    },
    woreda: {
      type: String,
      required: true,
      trim: true
    },
    kebele: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        /** 
         * Validates coordinates
         * @param {number[]} v - Array of coordinates
         * @returns {boolean} - True if coordinates are valid
         */
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be valid [longitude, latitude] pairs'
      }
    }
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  landUse: {
    type: String,
    required: true,
    enum: ['residential', 'agricultural', 'commercial', 'industrial', 'other']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Add indexes for better search performance
parcelSchema.index({ parcelNumber: 1 });
parcelSchema.index({ 
  'location.region': 1,
  'location.zone': 1,
  'location.woreda': 1,
  'location.kebele': 1
});
parcelSchema.index({ owner: 1, userId: 1 });

/**
 * Parcel Model
 * @type {mongoose.Model<IParcel, {}, {}, {}, mongoose.Document<unknown, {}, IParcel> & IParcel>}
 */
const Parcel = mongoose.model('Parcel', parcelSchema);

export default Parcel;