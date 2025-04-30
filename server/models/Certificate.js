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