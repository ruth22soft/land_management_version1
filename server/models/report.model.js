// models/Report.js

import mongoose from "mongoose";

/**
 * @typedef {Object} IReport
 * @property {string} title
 * @property {'Certificates Issued Report'|'Parcel Management Report'} type
 * @property {Date} generatedAt
 * @property {string} generatedBy
 * @property {ICertificateReport[] | IParcelReport[]} data
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ICertificateReport
 * @property {string} certificateNumber
 * @property {string} firstNameEn
 * @property {string} lastNameEn
 * @property {string} landDescEn
 * @property {number} landSize
 * @property {string} sizeUnit
 * @property {string} region
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} IParcelReport
 * @property {string} parcelNumber
 * @property {string} region
 * @property {number} landSize
 * @property {string} sizeUnit
 * @property {string} ownerName
 * @property {string} landUseType
 * @property {string} certificateNumber
 * @property {Date} createdAt
 */

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Certificates Issued Report", "Parcel Management Report", "Land Registration Report"],
      required: true,
    },
    generatedAt: { type: Date, default: Date.now },
    generatedBy: { type: String, required: true }, // user ID or name
    data: { type: [mongoose.Schema.Types.Mixed], required: true }, // Array of certificate or parcel data
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report; // Default export
