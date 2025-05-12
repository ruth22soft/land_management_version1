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

    // Generate unique numbers
    const registrationNumber = generateRegistrationNumber();
    const certificateNumber = generateCertificateNumber();

    // Generate QR code
    const qrCode = await generateQRCode(certificateNumber);

    // Extract file paths
    const documentPaths = files ? files.map((file) => file.path) : [];

    // Prepare certificate data
    const certificateData = {
      parcelId: parcel._id,
      firstNameAm: parcel.ownerNameAm.firstName,
      lastNameAm: parcel.ownerNameAm.lastName,
      firstNameEn: parcel.ownerNameEn.firstName,
      lastNameEn: parcel.ownerNameEn.lastName,
      nationalId: parcel.nationalId,
      dateOfBirth: body.dateOfBirth,
      phone: body.phone,
      addressAm: body.addressAm,
      addressEn: body.addressEn,
      fatherNameAm: body.fatherNameAm,
      fatherNameEn: body.fatherNameEn,
      motherNameAm: body.motherNameAm,
      motherNameEn: body.motherNameEn,
      maritalStatus: body.maritalStatus,
      children: body.children,
      regionAm: parcel.landLocation.regionAm,
      regionEn: parcel.landLocation.regionEn,
      zoneAm: parcel.landLocation.zoneAm,
      zoneEn: parcel.landLocation.zoneEn,
      woredaAm: parcel.landLocation.woredaAm,
      woredaEn: parcel.landLocation.woredaEn,
      kebeleAm: parcel.landLocation.kebeleAm,
      kebeleEn: parcel.landLocation.kebeleEn,
      block: parcel.landLocation.block,
      landDescAm: parcel.landDescription.am,
      landDescEn: parcel.landDescription.en,
      landSize: parcel.landSize,
      sizeUnit: parcel.sizeUnit,
      landUseType: parcel.landUseType,
      registrationNumber,
      certificateNumber,
      issuanceDate: body.issuanceDate || new Date(),
      issuingAuthorityAm: body.issuingAuthorityAm,
      issuingAuthorityEn: body.issuingAuthorityEn,
      expiryDate: body.expiryDate,
      documentPaths,
      qrCode,
      ownerPhoto: body.ownerPhoto,
      signatures: {
        owner: body.ownerSignature,
        authority: body.authoritySignature,
      },
      createdBy: req.user._id,
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