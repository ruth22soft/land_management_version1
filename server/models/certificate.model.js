// @ts-nocheck

import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  firstNameAm: String,
  firstNameEn: String,
  age: Number,
  gender: { type: String, enum: ["male", "female"] },
});

const certificateSchema = new mongoose.Schema(
  {
    parcelId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Parcel", 
      required: true 
    }, // Reference to the Parcel model
    firstNameAm: String,
    firstNameEn: String,
    lastNameAm: String,
    lastNameEn: String,
    dateOfBirth: Date,
    nationalId: String,
    phone: String,
    addressAm: String,
    addressEn: String,
    fatherNameAm: String,
    fatherNameEn: String,
    motherNameAm: String,
    motherNameEn: String,
    maritalStatus: { 
      type: String, 
      enum: ["Single", "Married", "Divorced", "Widowed"] 
    },
    children: [childSchema],
    regionAm: String,
    regionEn: String,
    zoneAm: String,
    zoneEn: String,
    woredaAm: String,
    woredaEn: String,
    kebeleAm: String,
    kebeleEn: String,
    block: String,
    landDescAm: String,
    landDescEn: String,
    landSize: Number,
    sizeUnit: String,
    landUseType: String,
    registrationNumber: { 
      type: String,
      unique: true,
      index: true
    },
    certificateNumber: { 
      type: String,
      unique: true,
      index: true,
      required: true,
      validate: {
        validator: function (v) {
          return /^CERT-\d{13}-\d{4}$/.test(v); // Ensure the certificate number matches the expected format
        },
        message: (props) =>
          `${props.value} is not a valid certificate number format! Expected format: CERT-TIMESTAMP-XXXX`,
      },
    },
    issuanceDate: { type: Date, default: Date.now },
    issuingAuthorityAm: String,
    issuingAuthorityEn: String,

    expiryDate: Date,
    documentPaths: [String],
    qrCode: String,
    ownerPhoto: String, // Path to the owner's photo
    landPhoto: String,       // Path to the land photo
    boundaryPhoto: String,   // Path to the boundary photo
    landPlanPhoto: String, 
    signatures: {
      owner: String, // Path to the owner's signature
      authority: String, // Path to the authority's signature
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;