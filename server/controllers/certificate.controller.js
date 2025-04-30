// @ts-nocheck
import Certificate from '../models/certificate.model.js';
import { generateRegistrationNumber, generateCertificateNumber, generateQRCode } from '../utils/utils.js';
import mongoose from 'mongoose';

/**
 * Create a new certificate
 */
export const createCertificate = async (req, res) => {
  try {
    const { body, files } = req;
    console.log('Received certificate creation request body:', body);

    // Generate unique numbers
    const registrationNumber = generateRegistrationNumber();
    const certificateNumber = generateCertificateNumber();

    // Generate QR code
    const qrCode = await generateQRCode(certificateNumber);

    // Extract file paths
    const documentPaths = files ? files.map(file => file.path) : [];

    // Ensure all location fields are captured
    const certificateData = {
      // Basic Info
      firstNameEn: body.firstNameEn,
      firstNameAm: body.firstNameAm,
      lastNameEn: body.lastNameEn,
      lastNameAm: body.lastNameAm,
      nationalId: body.nationalId,
      phone: body.phone,
      addressEn: body.addressEn,
      addressAm: body.addressAm,
      
      // Family Info
      fatherNameEn: body.fatherNameEn,
      fatherNameAm: body.fatherNameAm,
      motherNameEn: body.motherNameEn,
      motherNameAm: body.motherNameAm,
      maritalStatus: body.maritalStatus,
      
      // Location Information - English
      regionEn: body.regionEn,
      zoneEn: body.zoneEn,
      woredaEn: body.woredaEn,
      kebeleEn: body.kebeleEn,
      
      // Location Information - Amharic
      regionAm: body.regionAm,
      zoneAm: body.zoneAm,
      woredaAm: body.woredaAm,
      kebeleAm: body.kebeleAm,
      
      // Block Information
      block: body.block,
      
      // Land Information
      landSize: body.landSize,
      sizeUnit: body.sizeUnit || 'square meters',
      landUseType: body.landUseType,
      landDescEn: body.landDescEn,
      landDescAm: body.landDescAm,
      
      // Certificate Details
      registrationNumber,
      certificateNumber,
      issuanceDate: body.issuanceDate || new Date(),
      issuingAuthorityEn: body.issuingAuthorityEn,
      issuingAuthorityAm: body.issuingAuthorityAm,
      expiryDate: body.expiryDate,
      
      // System Fields
      documentPaths,
      qrCode,
      createdBy: req.user._id,
      status: 'active'
    };

    console.log('Creating certificate with data:', certificateData);

    // Create certificate with all fields
    const certificate = new Certificate(certificateData);

    // Save the certificate
    const savedCertificate = await certificate.save();
    console.log('Certificate saved successfully:', {
      certificateNumber: savedCertificate.certificateNumber,
      location: {
        regionEn: savedCertificate.regionEn,
        zoneEn: savedCertificate.zoneEn,
        woredaEn: savedCertificate.woredaEn,
        kebeleEn: savedCertificate.kebeleEn,
        block: savedCertificate.block
      }
    });

    res.status(201).json({
      success: true,
      data: savedCertificate,
      message: 'Certificate created successfully'
    });
  } catch (error) {
    console.error('Certificate creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating certificate',
      error: error.message
    });
  }
};

/**
 * Get all certificates
 */
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message
    });
  }
};

/**
 * Get a certificate by ID
 */
export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message
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

    // Get existing certificate
    const existingCertificate = await Certificate.findById(certificateId);
    if (!existingCertificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Update document paths if new files are uploaded
    let documentPaths = existingCertificate.documentPaths;
    if (files && files.length > 0) {
      documentPaths = [...documentPaths, ...files.map(file => file.path)];
    }

    // Update certificate
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        ...body,
        documentPaths,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCertificate
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating certificate',
      error: error.message
    });
  }
};

/**
 * Delete a certificate by ID
 */
export const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    await certificate.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting certificate',
      error: error.message
    });
  }
};

/**
 * Verify a certificate by certificate number
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    console.log('Verifying certificate number:', certificateNumber);

    // Use findOne for efficient lookup by certificate number
    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('createdBy', 'username email')
      .select('+regionEn +regionAm +zoneEn +zoneAm +woredaEn +woredaAm +kebeleEn +kebeleAm +block'); // Ensure these fields are included

    if (!certificate) {
      console.log('Certificate not found for number:', certificateNumber);
      return res.status(404).json({
        success: false,
        message: 'Certificate not found. Please check the certificate number and try again.'
      });
    }

    console.log('Certificate found:', certificate);

    // Check if certificate is expired
    const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date();

    // Create a clean response object with all required fields
    const responseData = {
      _id: certificate._id,
      firstNameEn: certificate.firstNameEn || '',
      firstNameAm: certificate.firstNameAm || '',
      lastNameEn: certificate.lastNameEn || '',
      lastNameAm: certificate.lastNameAm || '',
      nationalId: certificate.nationalId || '',
      phone: certificate.phone || '',
      addressAm: certificate.addressAm || '',
      addressEn: certificate.addressEn || '',
      // Location fields
      regionEn: certificate.regionEn || '',
      regionAm: certificate.regionAm || '',
      zoneEn: certificate.zoneEn || '',
      zoneAm: certificate.zoneAm || '',
      woredaEn: certificate.woredaEn || '',
      woredaAm: certificate.woredaAm || '',
      kebeleEn: certificate.kebeleEn || '',
      kebeleAm: certificate.kebeleAm || '',
      block: certificate.block || '',
      // Land details
      landSize: certificate.landSize || 0,
      sizeUnit: certificate.sizeUnit || 'square meters',
      landUseType: certificate.landUseType || '',
      landDescEn: certificate.landDescEn || '',
      landDescAm: certificate.landDescAm || '',
      // Certificate details
      registrationNumber: certificate.registrationNumber,
      certificateNumber: certificate.certificateNumber,
      issuanceDate: certificate.issuanceDate,
      issuingAuthorityAm: certificate.issuingAuthorityAm,
      issuingAuthorityEn: certificate.issuingAuthorityEn,
      status: isExpired ? 'expired' : certificate.status || 'active',
      verificationDate: new Date()
    };

    // Create combined location string
    responseData.location = [
      responseData.regionEn,
      responseData.zoneEn,
      responseData.woredaEn,
      responseData.kebeleEn,
      responseData.block
    ].filter(Boolean).join(', ');

    console.log('Sending verification response:', responseData);

    res.status(200).json({
      success: true,
      data: responseData,
      message: 'Certificate verified successfully'
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate. Please try again.',
      error: error.message
    });
  }
};