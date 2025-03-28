import { promises as fs } from 'fs';
import Certificate from '../models/certificate.model.js';
import Parcel from '../models/parcel.model.js';
import { generateCertificateNumber } from '../utils/certificate.utils.js';

// Utility function for handling file deletion
async function deleteUploadedFile(filePath) {
  if (!filePath) return;
  
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`Successfully deleted file: ${filePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting file:', error);
    }
  }
}

/**
 * Generate a new certificate
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const generateCertificate = async (req, res) => {
  try {
    const { recipientName, courseName, description, additionalFields } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Certificate document is required'
      });
    }

    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const certificate = new Certificate({
      userId,
      certificateNumber,
      recipientName,
      courseName,
      description,
      additionalFields,
      documentPath: req.file.path,
      status: 'pending'
    });

    const savedCertificate = await certificate.save();

    res.status(201).json({
      success: true,
      data: savedCertificate
    });
  } catch (error) {
    // Delete uploaded file if certificate creation fails
    if (req.file?.path) {
      await deleteUploadedFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Verify certificate by number
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('userId', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all certificates with optional filtering
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getCertificates = async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (fromDate || toDate) {
      query.issueDate = {};
      if (fromDate) query.issueDate.$gte = new Date(fromDate);
      if (toDate) query.issueDate.$lte = new Date(toDate);
    }

    const certificates = await Certificate.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update certificate status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateCertificateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.status = status;
    await certificate.save();

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating certificate status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Reset certificate status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const resetCertificateStatus = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Reset to pending status
    certificate.status = 'pending';
    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate status reset successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting certificate status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update certificate details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateCertificate = async (req, res) => {
  try {
    const { recipientName, courseName, description, additionalFields } = req.body;
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      if (req.file?.path) {
        await deleteUploadedFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Update document if new file is uploaded
    if (req.file) {
      // Delete old document
      if (certificate.documentPath) {
        await deleteUploadedFile(certificate.documentPath);
      }
      certificate.documentPath = req.file.path;
    }

    // Update other fields
    if (recipientName) certificate.recipientName = recipientName;
    if (courseName) certificate.courseName = courseName;
    if (description) certificate.description = description;
    if (additionalFields) certificate.additionalFields = additionalFields;

    await certificate.save();

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    if (req.file?.path) {
      await deleteUploadedFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error updating certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Revoke certificate
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const revokeCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.status = 'revoked';
    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate revoked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error revoking certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete certificate
 * @param {import('express').Request} req
 * @param {import('express').Response} res
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

    // Delete associated file
    if (certificate.documentPath) {
      await deleteUploadedFile(certificate.documentPath);
    }

    await certificate.deleteOne();

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get certificate statistics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getCertificateStats = async (req, res) => {
  try {
    const stats = {
      total: await Certificate.countDocuments(),
      byStatus: {
        pending: await Certificate.countDocuments({ status: 'pending' }),
        approved: await Certificate.countDocuments({ status: 'approved' }),
        rejected: await Certificate.countDocuments({ status: 'rejected' }),
        revoked: await Certificate.countDocuments({ status: 'revoked' })
      },
      recentActivity: await Certificate.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('userId', 'username')
        .select('certificateNumber status updatedAt')
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Bulk update certificates status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const bulkUpdateCertificates = async (req, res) => {
  try {
    const { certificateIds, status } = req.body;

    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Certificate IDs array is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'revoked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await Certificate.updateMany(
      { _id: { $in: certificateIds } },
      { $set: { status } }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} certificates`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating certificates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search certificates
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const searchCertificates = async (req, res) => {
  try {
    const { query, status, fromDate, toDate } = req.query;
    const searchQuery = {};

    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { certificateNumber: new RegExp(query, 'i') },
        { recipientName: new RegExp(query, 'i') },
        { courseName: new RegExp(query, 'i') }
      ];
    }

    // Filter by status
    if (status) {
      searchQuery.status = status;
    }

    // Date range filter
    if (fromDate || toDate) {
      searchQuery.createdAt = {};
      if (fromDate) searchQuery.createdAt.$gte = new Date(fromDate);
      if (toDate) searchQuery.createdAt.$lte = new Date(toDate);
    }

    const certificates = await Certificate.find(searchQuery)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching certificates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const generateCertificate = async (req, res) => {
  try {
    const { parcelId } = req.body;
    const userId = req.user.id;

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    if (parcel.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate certificate for unapproved parcel'
      });
    }

    const existingCertificate = await Certificate.findOne({ parcelId });
    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this parcel'
      });
    }

    const certificateNumber = await generateCertificateNumber();
    const certificate = new Certificate({
      userId,
      parcelId,
      certificateNumber,
      issuedDate: new Date(),
      status: 'active'
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('userId', 'username email')
      .populate('parcelId');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: {
        certificate,
        verificationStatus: 'valid',
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const bulkGenerateCertificates = async (req, res) => {
  try {
    const { parcelIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or empty parcel IDs array'
      });
    }

    const parcels = await Parcel.find({
      _id: { $in: parcelIds },
      status: 'approved'
    });

    const existingCertificates = await Certificate.find({
      parcelId: { $in: parcelIds }
    });

    const existingParcelIds = new Set(existingCertificates.map(cert => cert.parcelId.toString()));
    const validParcels = parcels.filter(parcel => !existingParcelIds.has(parcel._id.toString()));

    const certificates = await Promise.all(
      validParcels.map(async parcel => {
        const certificateNumber = await generateCertificateNumber();
        return new Certificate({
          userId,
          parcelId: parcel._id,
          certificateNumber,
          issuedDate: new Date(),
          status: 'active'
        });
      })
    );

    if (certificates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid parcels found for certificate generation'
      });
    }

    const savedCertificates = await Certificate.insertMany(certificates);

    res.status(201).json({
      success: true,
      message: `Successfully generated ${savedCertificates.length} certificates`,
      data: {
        certificates: savedCertificates,
        totalProcessed: parcelIds.length,
        totalGenerated: savedCertificates.length,
        skipped: parcelIds.length - savedCertificates.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in bulk certificate generation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (certificate.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is already revoked'
      });
    }

    certificate.status = 'revoked';
    certificate.revocationReason = reason;
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user.id;

    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error revoking certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCertificateHistory = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findById(certificateId)
      .populate('userId', 'username email')
      .populate('parcelId')
      .populate('revokedBy', 'username email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const history = {
      certificate,
      events: [
        {
          type: 'issuance',
          date: certificate.issuedDate,
          by: certificate.userId
        }
      ]
    };

    if (certificate.status === 'revoked') {
      history.events.push({
        type: 'revocation',
        date: certificate.revokedAt,
        by: certificate.revokedBy,
        reason: certificate.revocationReason
      });
    }

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};