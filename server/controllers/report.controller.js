// @ts-nocheck
import Report from '../models/report.model.js';
import Certificate from '../models/certificate.model.js';
import Parcel from '../models/parcel.model.js';

/**
 * Create a new report
 */
export const createReport = async (req, res) => {
  try {
    const { title, type, data } = req.body;

    const report = new Report({
      title,
      type,
      generatedBy: req.user.id, // Assuming `req.user` is populated by authentication middleware
      data,
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: 'Error creating report', error });
  }
};

/**
 * Generate a report based on the selected type
 */
export const generateReport = async (req, res) => {
  const { type, startDate, endDate } = req.body;

  try {
    console.log(`Generating ${type} report with date range:`, { startDate, endDate });
    let data = [];
    let title = '';

    // Filter by date range if provided
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { $gte: new Date(startDate) };
    if (endDate) dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };

    console.log('Date filter:', dateFilter);

    // Generate report based on type
    switch (type) {
      case 'Certificates Issued Report':
        title = 'Certificates Issued Report';
        console.log('Fetching certificates with filter:', dateFilter);
        
        // Get all certificates matching date filter
        data = await Certificate.find(dateFilter)
          .sort({ createdAt: -1 })
          .select(
            'certificateNumber firstNameEn lastNameEn landUseType landSize sizeUnit createdAt regionEn'
          )
          .lean();
        
        console.log(`Found ${data.length} certificates`);
        
        // Add a default status since it might not be present
        data = data.map(item => ({
          ...item,
          status: 'Issued'
        }));
        break;

      case 'Parcel Management Report':
        title = 'Parcel Management Report';
        data = await Parcel.find(dateFilter)
          .sort({ createdAt: -1 })
          .select(
            'parcelNumber location size sizeUnit landUseType certificateNumber createdAt'
          )
          .lean();
        
        // Add a default status
        data = data.map(item => ({
          ...item,
          status: 'Active'
        }));
        break;
        
      case 'Land Registration Report':
        title = 'Land Registration Report';
        // For land registration, we'll get certificates with additional data about parcels
        data = await Certificate.find(dateFilter)
          .sort({ createdAt: -1 })
          .select(
            'certificateNumber firstNameEn lastNameEn landSize sizeUnit landUseType createdAt regionEn'
          )
          .lean();
        
        console.log(`Found ${data.length} land registrations`);
        
        // Add formatted fields that might be needed in the report
        data = data.map(item => ({
          ...item,
          registrationType: 'New Registration', // Default
          details: `Land Registration for ${item.firstNameEn || ''} ${item.lastNameEn || ''}`.trim(),
          location: item.regionEn || 'Unknown',
          parcelSize: item.landSize ? `${item.landSize} ${item.sizeUnit || 'sq.m'}` : 'Not specified',
          status: 'Completed' // Default status
        }));
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type selected.' });
    }

    // Save the report metadata in the database
    const report = new Report({
      title,
      type,
      generatedBy: req.user.id, // Assuming `req.user` is populated by authentication middleware
      data,
    });

    const savedReport = await report.save();

    // Return the generated report
    res.status(200).json({ report: savedReport, data });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      message: 'Error generating report', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

/**
 * Get all reports
 */
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('generatedBy', 'username email');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error });
  }
};

/**
 * Get a report by ID
 */
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('generatedBy', 'username email');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report', error });
  }
};

/**
 * Delete a report by ID
 */
export const deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report', error });
  }
};