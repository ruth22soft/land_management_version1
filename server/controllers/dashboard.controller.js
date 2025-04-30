// @ts-nocheck
import Certificate from '../models/certificate.model.js';
import Parcel from '../models/parcel.model.js';
import User from '../models/user.model.js';

/**
 * Get dashboard data for Registration Officer
 */
export const getRegistrationOfficerDashboard = async (req, res) => {
  try {
    // Fetch counts for certificates and parcels
    const totalCertificates = await Certificate.countDocuments();
    const totalParcels = await Parcel.countDocuments();

    // Fetch monthly trends for certificates and parcels
    const monthlyTrends = await getMonthlyTrends();

    res.status(200).json({
      totalCertificates,
      totalParcels,
      monthlyTrends,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};

/**
 * Get dashboard data for Admin
 */
export const getAdminDashboard = async (req, res) => {
  try {
    // Fetch counts for certificates, parcels, users, and monthly registrations
    const totalCertificates = await Certificate.countDocuments();
    const totalParcels = await Parcel.countDocuments();
    const totalUsers = await User.countDocuments();
    const monthlyRegistrations = await Certificate.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }, // Current month's registrations
    });

    // Fetch monthly trends for certificates and parcels
    const monthlyTrends = await getMonthlyTrends();

    // Fetch parcel type distribution
    const parcelTypeDistribution = await Parcel.aggregate([
      { $group: { _id: '$landUseType', count: { $sum: 1 } } },
    ]);

    // Fetch registration status
    const registrationStatus = await Parcel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalCertificates,
      totalParcels,
      totalUsers,
      monthlyRegistrations,
      monthlyTrends,
      parcelTypeDistribution,
      registrationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};

/**
 * Helper function to fetch monthly trends
 */
const getMonthlyTrends = async () => {
  const currentYear = new Date().getFullYear();

  const trends = await Certificate.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        certificatesIssued: { $sum: 1 },
      },
    },
  ]);

  const parcelTrends = await Parcel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        parcelsRegistered: { $sum: 1 },
      },
    },
  ]);

  return { trends, parcelTrends };
};