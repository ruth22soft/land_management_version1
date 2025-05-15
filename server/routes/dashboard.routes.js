import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Certificate from '../models/certificate.model.js';
import Parcel from '../models/parcel.model.js';
import User from '../models/user.model.js';

const router = express.Router();

// Add a simple test route - NO AUTH for testing
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Dashboard API is working',
    timestamp: new Date().toISOString()
  });
});

// Get Registration Dashboard data
router.get('/registration', authenticate, authorize(['registration']), async (req, res) => {
  try {
    // Count pending and active certificates
    const completedCertifications = await Certificate.countDocuments();
    
    // Count pending parcels (parcels without certificates)
    const pendingParcels = await Parcel.countDocuments({
      _id: { $nin: await Certificate.distinct('parcelId') }
    });
    
    // Count active parcels
    const activeParcels = await Parcel.countDocuments();
    
    // Count monthly registrations - certificates created in the current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthlyRegistrations = await Certificate.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });

    res.json({
      pendingParcels,
      completedCertifications,
      activeParcels,
      monthlyRegistrations
    });
  } catch (error) {
    console.error('Error fetching registration dashboard data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard data', 
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
});

// Get Admin Dashboard data 
router.get('/admin', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Count total certifications - without filtering by status
    const totalCertifications = await Certificate.countDocuments();
    
    // Count active parcels
    const activeParcels = await Parcel.countDocuments();
    
    // Count registered users
    const registeredUsers = await User.countDocuments();
    
    // Count monthly registrations
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthlyRegistrations = await Certificate.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });

    // Log counts for debugging
    console.log('Admin Dashboard Data:', {
      totalCertifications,
      activeParcels,
      registeredUsers,
      monthlyRegistrations
    });

    res.json({
      totalCertifications,
      activeParcels,
      registeredUsers,
      monthlyRegistrations
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard data', 
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
});

// Get Monthly Activity data for charts
router.get('/monthly-activity', async (req, res) => {
  try {
    // Get the current date
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialize the results array with all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({
      month,
      registrations: 0,
      certificates: 0,
      parcels: 0
    }));
    
    // Get certificates created in each month of the current year
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      
      const certificateCount = await Certificate.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const parcelCount = await Parcel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      // Update the results array
      monthlyData[month].certificates = certificateCount;
      monthlyData[month].parcels = parcelCount;
      monthlyData[month].registrations = certificateCount + parcelCount; // Total activity
    }
    
    // Return only the first 6 months or all available months if we're past June
    const currentMonth = now.getMonth();
    const dataToReturn = currentMonth >= 5 
      ? monthlyData.slice(0, currentMonth + 1) 
      : monthlyData.slice(0, 6);
    
    res.json(dataToReturn);
  } catch (error) {
    console.error('Error fetching monthly activity data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching monthly activity data', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get Parcel Type Distribution data for charts
router.get('/parcel-types', async (req, res) => {
  try {
    // Define the parcel types we're looking for
    const parcelTypeMap = {
      'Residential': { count: 0, color: '#0088FE' },
      'Commercial': { count: 0, color: '#00C49F' },
      'Agricultural': { count: 0, color: '#FFBB28' },
      'Industrial': { count: 0, color: '#FF8042' }
    };
    
    // Try to find parcels with a landUseType field
    const parcels = await Parcel.find().lean();
    
    // Count parcels by type
    parcels.forEach(parcel => {
      // Use a safe approach to extract type information
      let parcelType = 'Residential'; // Default type
      
      // Try to get the type from the document, handling potential missing fields
      const rawType = parcel.landUseType || 'Residential';
      
      // Normalize the type
      if (/commerc|business|office|retail|shop/i.test(rawType)) {
        parcelType = 'Commercial';
      } else if (/agri|farm|crop|rural/i.test(rawType)) {
        parcelType = 'Agricultural';
      } else if (/indust|factory|manufactur|warehouse/i.test(rawType)) {
        parcelType = 'Industrial';
      } else if (/residen|home|house|apartment|dwelling/i.test(rawType)) {
        parcelType = 'Residential';
      }
      
      // Safely increment the count
      if (parcelType === 'Residential') parcelTypeMap.Residential.count++;
      else if (parcelType === 'Commercial') parcelTypeMap.Commercial.count++;
      else if (parcelType === 'Agricultural') parcelTypeMap.Agricultural.count++;
      else if (parcelType === 'Industrial') parcelTypeMap.Industrial.count++;
    });
    
    // Convert to the format expected by the frontend
    const result = [
      { name: 'Residential', value: parcelTypeMap.Residential.count, color: parcelTypeMap.Residential.color },
      { name: 'Commercial', value: parcelTypeMap.Commercial.count, color: parcelTypeMap.Commercial.color },
      { name: 'Agricultural', value: parcelTypeMap.Agricultural.count, color: parcelTypeMap.Agricultural.color },
      { name: 'Industrial', value: parcelTypeMap.Industrial.count, color: parcelTypeMap.Industrial.color }
    ];
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching parcel type distribution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching parcel type distribution', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get Recent Activity for dashboard
router.get('/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit?.toString() || '5');
    
    // Get the most recent certificates
    const recentCertificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('certificateNumber ownerFirstName ownerLastName createdAt')
      .lean();
    
    // Format the data for the frontend
    const activities = recentCertificates.map(cert => ({
      id: cert._id,
      type: 'certificate',
      title: `Certificate Created: ${cert.certificateNumber || 'No Number'}`,
      owner: `${cert.ownerFirstName || ''} ${cert.ownerLastName || ''}`.trim() || 'Unknown Owner',
      date: cert.createdAt,
      by: 'Registration Office'
    }));
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recent activity', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get Pending Certifications
router.get('/pending-certifications', async (req, res) => {
  try {
    // Instead of filtering by status, just get the most recent certificates
    const recentCertificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('certificateNumber ownerFirstName ownerLastName createdAt landLocation')
      .lean();
      
    // Format for display
    const formattedCertificates = recentCertificates.map(cert => {
      return {
        _id: cert._id,
        certificateNumber: cert.certificateNumber || 'No Number',
        firstNameEn: cert.ownerFirstName || 'Unknown',
        lastNameEn: cert.ownerLastName || 'Unknown',
        createdAt: cert.createdAt,
        region: cert.landLocation?.region || 'Unknown',
        status: 'Pending' // Default status for UI display
      };
    });
    
    res.json(formattedCertificates);
  } catch (error) {
    console.error('Error fetching recent certifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recent certifications', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;