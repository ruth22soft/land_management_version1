// models/Parcel.js

import mongoose from "mongoose";

/**
 * @typedef {Object} IParcel
 * @property {string} parcelNumber
 * @property {string} location
 * @property {string} region
 * @property {string} zone
 * @property {string} woreda
 * @property {string} kebele
 * @property {string} block
 * @property {number} size
 * @property {string} sizeUnit
 * @property {string} ownerName
 * @property {string} nationalId
 * @property {string} landUseType
 * @property {string} certificateNumber
 * @property {Object} landLocation
 * @property {string} landLocation.region
 * @property {string} landLocation.zone
 * @property {string} landLocation.woreda
 * @property {string} landLocation.kebele
 * @property {string} landLocation.block
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const landLocationSchema = new mongoose.Schema({
  region: { type: String, required: true },
  zone: { type: String, required: true },
  woreda: { type: String, required: true },
  kebele: { type: String, required: true },
  block: { type: String }
}, { _id: false });

const parcelSchema = new mongoose.Schema(
  {
    parcelNumber: { type: String, required: true, unique: true },
    // Combined location string (for backward compatibility)
    location: { type: String, required: true },
    // Individual location fields
    region: { type: String, required: true },
    zone: { type: String, required: true },
    woreda: { type: String, required: true },
    kebele: { type: String, required: true },
    block: { type: String },
    // Nested location object
    landLocation: { type: landLocationSchema, required: true },
    // Other fields
    size: { type: Number, required: true },
    sizeUnit: { type: String, default: 'square meters' },
    ownerName: { type: String, required: true },
    nationalId: { type: String },
    landUseType: { type: String, required: true },
    certificateNumber: { type: String, required: true },
    // Add reference to certificate
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }
  },
  { timestamps: true }
);

// Add index for certificate number for faster lookups
parcelSchema.index({ certificateNumber: 1 });

const Parcel = mongoose.model("Parcel", parcelSchema);

export default Parcel; // Default export
