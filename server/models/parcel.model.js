// models/Parcel.js

import mongoose from "mongoose";

/**
 * @typedef {Object} IParcel
 * @property {string} parcelNumber
 * @property {string} ownerName
 * @property {string} nationalId
 * @property {Object} landLocation
 * @property {string} landLocation.regionAm
 * @property {string} landLocation.regionEn
 * @property {string} landLocation.zoneAm
 * @property {string} landLocation.zoneEn
 * @property {string} landLocation.woredaAm
 * @property {string} landLocation.woredaEn
 * @property {string} landLocation.kebeleAm
 * @property {string} landLocation.kebeleEn
 * @property {string} landLocation.blockAm
 * @property {string} landLocation.blockEn
 * @property {Object} landDescription
 * @property {string} landDescription.am
 * @property {string} landDescription.en
 * @property {number} landSize
 * @property {string} sizeUnit
 * @property {string} landUseType
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const landLocationSchema = new mongoose.Schema({
    regionAm: { type: String, required: true },
    regionEn: { type: String, required: true },
    zoneAm: { type: String, required: true },
    zoneEn: { type: String, required: true },
    woredaAm: { type: String, required: true },
    woredaEn: { type: String, required: true },
    kebeleAm: { type: String, required: true },
    kebeleEn: { type: String, required: true },
    blockAm: { type: String },
    blockEn: { type: String },
}, { _id: false });

const parcelSchema = new mongoose.Schema(
  {
    parcelNumber: { type: String,  unique: true },// Automatically generated
    ownerName: {
      type: String,
      required: true,
      validate: {
        // @ts-ignore
        validator: function (v) {
          return /^[a-zA-Z]+ [a-zA-Z]+$/.test(v); // Ensures at least two words
        },
        // @ts-ignore
        message: (props) => `${props.value} is not a valid full name. Please provide a first and last name.`,
      },
    },
    nationalId: { type: String },
    // Nested location object
    landLocation: { type: landLocationSchema, required: true },
    landDescription: {
      am: { type: String, required: true },
      en: { type: String, required: true },
    },
    landSize: { type: Number, required: true },
    sizeUnit: { type: String, default: "square meters" },
    landUseType: {
      type: String,
      enum: ["Residential", "Agricultural", "Commercial", "Industrial", "Mixed Use"],
      required: true,
    },
    //certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending", // Default status is "pending"
    },
    history: [
      {
        action: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who performed the action
        date: { type: Date, default: Date.now },
        remarks: { type: String },
      },
    ],
  },
  { timestamps: true }
);



// Middleware to generate a unique parcel number
parcelSchema.pre("save", async function (next) {
  if (!this.parcelNumber) {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of the timestamp
    this.parcelNumber = `PARCEL-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`; // Example: PARCEL-123456-5678
  }
  next();
});


const Parcel = mongoose.model("Parcel", parcelSchema);

export default Parcel; // Default export
