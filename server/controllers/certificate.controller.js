// @ts-nocheck
import Certificate from "../models/certificate.model.js";
import Parcel from "../models/parcel.model.js";
import { generateRegistrationNumber, generateCertificateNumber, generateQRCode } from "../utils/utils.js";

/**
 * Create a new certificate
 */
export const createCertificate = async (req, res) => {
  try {
    const { body, files } = req;

    // Fetch the parcel data using the parcelId
    const parcel = await Parcel.findById(body.parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Use numbers from frontend if provided, otherwise generate
    const registrationNumber = body.registrationNumber || generateRegistrationNumber();
    const certificateNumber = body.certificateNumber || generateCertificateNumber();
    const status = body.status || "approved";

    // Generate QR code
    const qrCode = await generateQRCode(certificateNumber);

    // Get file paths from req.files
    const landPhoto = req.files?.landPhoto?.[0]?.path || null;
    const boundaryPhoto = req.files?.boundaryPhoto?.[0]?.path || null;
    const ownerPhoto = req.files?.ownerPhoto?.[0]?.path || null;
    const landPlanImage = req.files?.landPlanImage?.[0]?.path || null;

    // Parse landLocation if it's a string
    let landLocation = body.landLocation;
    if (typeof landLocation === 'string') {
      try {
        landLocation = JSON.parse(landLocation);
      } catch (e) {
        landLocation = undefined;
      }
    }

    // Parse landDescription if it's a string
    let landDescription = body.landDescription;
    if (typeof landDescription === 'string') {
      try {
        landDescription = JSON.parse(landDescription);
      } catch (e) {
        landDescription = undefined;
      }
    }

    // Parse legalRights if it's a string
    let legalRights = body.legalRights;
    if (typeof legalRights === 'string') {
      try {
        legalRights = JSON.parse(legalRights);
      } catch (e) {
        legalRights = { en: '', am: '' };
      }
    }

    // Parse termsAndConditions if it's a string
    let termsAndConditions = body.termsAndConditions;
    if (typeof termsAndConditions === 'string') {
      try {
        termsAndConditions = JSON.parse(termsAndConditions);
      } catch (e) {
        termsAndConditions = { en: '', am: '' };
      }
    }

    // Parse signatures if it's a string
    let signatures = body.signatures;
    if (typeof signatures === 'string') {
      try {
        signatures = JSON.parse(signatures);
      } catch (e) {
        signatures = { owner: null, registrationOfficer: null };
      }
    }

    // Prepare certificate data, mapping all frontend fields to model
    const certificateData = {
      parcelId: parcel._id,
      parcelNumber: body.parcelNumber || parcel.parcelNumber,
      certificateNumber,
      registrationNumber,
      status,
      dateOfIssuance: body.dateOfIssuance ? new Date(body.dateOfIssuance) : new Date(),
      // Owner Information
      ownerFirstName: body.ownerFirstName || parcel.ownerNameEn?.firstName || '',
      ownerFirstNameAm: body.ownerFirstNameAm || parcel.ownerNameAm?.firstName || '',
      ownerLastName: body.ownerLastName || parcel.ownerNameEn?.lastName || '',
      ownerLastNameAm: body.ownerLastNameAm || parcel.ownerNameAm?.lastName || '',
      nationalId: body.nationalId || parcel.nationalId || '',
      phone: body.phone || '',
      address: body.address || '',
      addressAm: body.addressAm || '',
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      // Additional Personal Information
      fatherName: body.fatherName || '',
      fatherNameAm: body.fatherNameAm || '',
      motherName: body.motherName || '',
      motherNameAm: body.motherNameAm || '',
      maritalStatus: body.maritalStatus || '',
      // Land Location (nested object)
      landLocation: landLocation || {
        region: parcel.landLocation?.regionEn || '',
        regionAm: parcel.landLocation?.regionAm || '',
        zone: parcel.landLocation?.zoneEn || '',
        zoneAm: parcel.landLocation?.zoneAm || '',
        woreda: parcel.landLocation?.woredaEn || '',
        woredaAm: parcel.landLocation?.woredaAm || '',
        kebele: parcel.landLocation?.kebeleEn || '',
        kebeleAm: parcel.landLocation?.kebeleAm || '',
        block: parcel.landLocation?.blockEn || parcel.landLocation?.blockAm || '',
        blockAm: parcel.landLocation?.blockAm || '',
      },
      // Land Details
      landDescription: landDescription || {
        en: parcel.landDescription?.en || '',
        am: parcel.landDescription?.am || '',
      },
      landSize: body.landSize !== undefined ? Number(body.landSize) : (parcel.landSize !== undefined ? Number(parcel.landSize) : undefined),
      sizeUnit: body.sizeUnit || parcel.sizeUnit || '',
      landUseType: body.landUseType || parcel.landUseType || '',
      landUseTypeAm: body.landUseTypeAm || '',
      // Legal Details
      legalRights: legalRights || { en: '', am: '' },
      termsAndConditions: termsAndConditions || { en: '', am: '' },
      // Certificate Details
      issuingAuthority: body.issuingAuthority || '',
      issuingAuthorityAm: body.issuingAuthorityAm || '',
      registrationOfficer: body.registrationOfficer || '',
      registrationOfficerAm: body.registrationOfficerAm || '',
      additionalNotes: body.additionalNotes || '',
      additionalNotesAm: body.additionalNotesAm || '',
      // Photos and Signatures
      landPhoto,
      boundaryPhoto,
      ownerPhoto,
      landPlanImage,
      signatures: signatures || { owner: null, registrationOfficer: null },
      documentPaths: [],
      qrCode,
      createdBy: req.user?._id,
    };

    // Create and save the certificate
    const certificate = new Certificate(certificateData);
    const savedCertificate = await certificate.save();

    res.status(201).json({
      success: true,
      data: savedCertificate,
      message: "Certificate created successfully",
    });
  } catch (error) {
    console.error(error); // Print full error to terminal
    res.status(500).json({
      success: false,
      message: "Error creating certificate",
      error: error.message,
    });
  }
};

/**
 * Get all certificates
 */
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("parcelId", "parcelNumber ownerNameAm ownerNameEn landLocation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching certificates",
      error: error.message,
    });
  }
};

/**
 * Get a certificate by ID
 */
export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("parcelId", "parcelNumber ownerNameAm ownerNameEn landLocation");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching certificate",
      error: error.message,
    });
  }
};

/**
 * Update a certificate by ID
 */
export const updateCertificate = async (req, res) => {
  try {
    const { body, files } = req;
    const certificateId = req.params.id;

    // Fetch the existing certificate
    const existingCertificate = await Certificate.findById(certificateId);
    if (!existingCertificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Update document paths if new files are uploaded
    let documentPaths = existingCertificate.documentPaths;
    if (files && files.length > 0) {
      documentPaths = [...documentPaths, ...files.map((file) => file.path)];
    }

    // Update certificate fields
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        ...body,
        documentPaths,
        updatedBy: req.user._id,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCertificate,
      message: "Certificate updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating certificate",
      error: error.message,
    });
  }
};

/**
 * Delete a certificate by ID
 */
export const deleteCertificate = async (req, res) => {
  try {
    const certificateId = req.params.id;

    // Fetch the certificate
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Delete the certificate
    await certificate.deleteOne();

    res.status(200).json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting certificate",
      error: error.message,
    });
  }
};

/**
 * Verify a certificate by certificate number
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber })
      .populate("parcelId", "parcelNumber ownerNameAm ownerNameEn landLocation");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const isExpired =
      certificate.expiryDate && new Date(certificate.expiryDate) < new Date();

    res.status(200).json({
      success: true,
      data: {
        ...certificate.toObject(),
        status: isExpired ? "expired" : "active",
      },
      message: "Certificate verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying certificate",
      error: error.message,
    });
  }
};