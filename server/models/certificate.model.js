// @ts-nocheck

import mongoose from "mongoose";

const landLocationSchema = new mongoose.Schema({
  region: String,
  regionAm: String,
  zone: String,
  zoneAm: String,
  woreda: String,
  woredaAm: String,
  kebele: String,
  kebeleAm: String,
  block: String,
  blockAm: String,
}, { _id: false });

const landDescriptionSchema = new mongoose.Schema({
  en: String,
  am: String,
}, { _id: false });

const legalRightsSchema = new mongoose.Schema({
  en: String,
  am: String,
}, { _id: false });

const termsAndConditionsSchema = new mongoose.Schema({
  en: String,
  am: String,
}, { _id: false });

const signaturesSchema = new mongoose.Schema({
  owner: String,
  registrationOfficer: String,
}, { _id: false });

const certificateSchema = new mongoose.Schema(
  {
    parcelId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Parcel", 
      required: true 
    },
    parcelNumber: String,
    certificateNumber: { type: String, required: true, unique: true, index: true },
    registrationNumber: { type: String, unique: true, index: true },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected", "expired"],
      default: "approved"
    },
    dateOfIssuance: Date,
    // Owner Information
    ownerFirstName: String,
    ownerFirstNameAm: String,
    ownerLastName: String,
    ownerLastNameAm: String,
    nationalId: String,
    phone: String,
    address: String,
    addressAm: String,
    dateOfBirth: Date,
    // Additional Personal Information
    fatherName: String,
    fatherNameAm: String,
    motherName: String,
    motherNameAm: String,
    maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"] },
    // Land Location
    landLocation: landLocationSchema,
    // Land Details
    landDescription: landDescriptionSchema,
    landSize: { type: Number },
    sizeUnit: String,
    landUseType: String,
    landUseTypeAm: String,
    // Legal Details
    legalRights: legalRightsSchema,
    termsAndConditions: termsAndConditionsSchema,
    // Certificate Details
    issuingAuthority: String,
    issuingAuthorityAm: String,
    registrationOfficer: String,
    registrationOfficerAm: String,
    additionalNotes: String,
    additionalNotesAm: String,
    // Photos and Signatures
    landPhoto: String,
    boundaryPhoto: String,
    ownerPhoto: String,
    landPlanImage: String,
    signatures: signaturesSchema,
    documentPaths: [String],
    qrCode: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;