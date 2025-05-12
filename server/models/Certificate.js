const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certificateNumber: {
        type: String,
        required: true,
        unique: true
    },
    parcelId: {
        type: String,
        required: true,
        unique: true
    },
    dateOfIssuance: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Owner Information
    ownerInfo: {
        firstName: { type: String, required: true },
        firstNameAm: { type: String, required: true },
        lastName: { type: String, required: true },
        lastNameAm: { type: String, required: true },
        nationalId: { type: String, required: true },
        phone: String,
        address: String,
        addressAm: String,
        dateOfBirth: Date,
        fatherName: String,
        fatherNameAm: String,
        motherName: String,
        motherNameAm: String,
        maritalStatus: String
    },
    // Children Information
    children: [{
        name: String,
        nameAm: String,
        age: Number,
        gender: String
    }],
    // Land Location
    landLocation: {
        region: { type: String, required: true },
        regionAm: { type: String, required: true },
        zone: String,
        zoneAm: String,
        woreda: String,
        woredaAm: String,
        kebele: String,
        kebeleAm: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    // Land Details
    landDetails: {
        area: { type: Number, required: true },
        areaUnit: { type: String, required: true },
        landUse: String,
        acquisitionType: String,
        acquisitionDate: Date,
        propertyType: String,
        boundaries: {
            north: String,
            south: String,
            east: String,
            west: String
        }
    },
    // Legal Information
    legalInfo: {
        legalRights: {
            en: String,
            am: String
        },
        termsAndConditions: {
            en: String,
            am: String
        },
        restrictions: [String]
    },
    // Signatures and Photos
    signatures: {
        ownerSignature: String,
        registrarSignature: String,
        witnessSignatures: [String]
    },
    photos: {
        ownerPhoto: String,
        landPhotos: [String],
        documentPhotos: [String]
    },
    // Metadata
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'revoked'],
        default: 'draft'
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate certificate number before saving
certificateSchema.pre('save', function(next) {
    if (!this.certificateNumber) {
        const year = new Date().getFullYear();
        const random = Math.floor(100000 + Math.random() * 900000);
        this.certificateNumber = `LRMS-${year}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Certificate', certificateSchema);

// @ts-nocheck
// import mongoose from "mongoose";

// /**
//  * @typedef {Object} IChild
//  * @property {string} firstNameAm
//  * @property {string} firstNameEn
//  * @property {number} age
//  * @property {'male'|'female'} gender
//  */

// /**
//  * @typedef {Object} ICertificate
//  * @property {string} firstNameAm
//  * @property {string} firstNameEn
//  * @property {string} lastNameAm
//  * @property {string} lastNameEn
//  * @property {Date} dateOfBirth
//  * @property {string} nationalId
//  * @property {string} phone
//  * @property {string} addressAm
//  * @property {string} addressEn
//  * @property {string} fatherNameAm
//  * @property {string} fatherNameEn
//  * @property {string} motherNameAm
//  * @property {string} motherNameEn
//  * @property {string} maritalStatus
//  * @property {IChild[]} children
//  * @property {string} regionAm
//  * @property {string} regionEn
//  * @property {string} zoneAm
//  * @property {string} zoneEn
//  * @property {string} woredaAm
//  * @property {string} woredaEn
//  * @property {string} kebeleAm
//  * @property {string} kebeleEn
//  * @property {string} block
//  * @property {string} landDescAm
//  * @property {string} landDescEn
//  * @property {number} landSize
//  * @property {string} sizeUnit
//  * @property {string} landUseType
//  * @property {string} registrationNumber
//  * @property {string} certificateNumber
//  * @property {Date} issuanceDate
//  * @property {string} issuingAuthorityAm
//  * @property {string} issuingAuthorityEn
//  * @property {Date} expiryDate
//  * @property {string[]} documentPaths
//  * @property {string} qrCode
//  * @property {string} createdBy
//  * @property {Date} createdAt
//  * @property {Date} updatedAt
//  */

// const childSchema = new mongoose.Schema({
//   firstNameAm: String,
//   firstNameEn: String,
//   age: Number,
//   gender: { type: String, enum: ["male", "female"] },
// });

// const certificateSchema = new mongoose.Schema(
//   {
//     firstNameAm: String,
//     firstNameEn: String,
//     lastNameAm: String,
//     lastNameEn: String,
//     dateOfBirth: Date,
//     nationalId: String,
//     phone: String,
//     addressAm: String,
//     addressEn: String,
//     fatherNameAm: String,
//     fatherNameEn: String,
//     motherNameAm: String,
//     motherNameEn: String,
//     maritalStatus: String,
//     children: [childSchema],
//     regionAm: String,
//     regionEn: String,
//     zoneAm: String,
//     zoneEn: String,
//     woredaAm: String,
//     woredaEn: String,
//     kebeleAm: String,
//     kebeleEn: String,
//     block: String,
//     landDescAm: String,
//     landDescEn: String,
//     landSize: Number,
//     sizeUnit: String,
//     landUseType: String,
//     registrationNumber: { 
//       type: String,
//       unique: true,
//       index: true
//     },
//     certificateNumber: { 
//       type: String,
//       unique: true,
//       index: true,
//       required: true,
//       validate: {
//         validator: function(v) {
//           return /^CERT-\d{13}-\d{4}$/.test(v);
//         },
//         message: props => `${props.value} is not a valid certificate number format! Expected format: CERT-TIMESTAMP-XXXX`
//       }
//     },
//     issuanceDate: Date,
//     issuingAuthorityAm: String,
//     issuingAuthorityEn: String,
//     expiryDate: Date,
//     documentPaths: [String],
//     qrCode: String,
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// const Certificate = mongoose.model("Certificate", certificateSchema);

// export default Certificate; // Default export
// Ts-ignore