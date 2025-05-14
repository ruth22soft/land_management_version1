import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

const GenerateReport = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const { user } = useContext(AuthContext);
  const tableRef = useRef(null);

  const reportTypes = [
    { value: 'Certificates Issued Report', label: 'Certificates Issued Report' },
    { value: 'Parcel Management Report', label: 'Parcel Management Report' },
    { value: 'Land Registration Report', label: 'Land Registration Report' },
  ];

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'issued':
      case 'active':
        return 'success';
      case 'pending':
      case 'under review':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType) return;
    setLoading(true);
    setError(null);
    setReportData([]);
    setReportTitle('');
    try {
      // Get JWT token
      let token = null;
      if (user && user.token) {
        token = user.token;
      } else {
        token = localStorage.getItem('token');
      }
      const headers = token ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      } : { 'Content-Type': 'application/json' };
      // Prepare payload
      const payload = {
        type: reportType,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      };
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to generate report');
      }
      const result = await response.json();
      setReportData(result.data || []);
      setReportTitle(result.report?.title || reportType);
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle PDF generation
  const handlePdfExport = () => {
    if (!reportType || reportData.length === 0) return;

    const doc = new jsPDF();
    let head = [];
    let tableData = [];
    if (reportType === 'Certificates Issued Report') {
      head = [['Certificate Number', 'First Name', 'Last Name', 'Land Use Type', 'Land Size', 'Unit', 'Region', 'Date Issued', 'Status']];
      tableData = reportData.map(row => [
        row.certificateNumber || '',
        row.firstNameEn || '',
        row.lastNameEn || '',
        row.landUseType || '',
        row.landSize || '',
        row.sizeUnit || '',
        row.regionEn || '',
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
        row.status || ''
      ]);
    } else if (reportType === 'Parcel Management Report') {
      head = [['Parcel Number', 'Region', 'Land Size', 'Unit', 'Land Use Type', 'Date Registered', 'Status']];
      tableData = reportData.map(row => [
        row.parcelNumber || '',
        row.landLocation?.regionEn || row.regionEn || '',
        row.landSize ?? row.size ?? '',
        row.sizeUnit || '',
        row.landUseType || '',
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
        row.status || ''
      ]);
    } else if (reportType === 'Land Registration Report') {
      head = [['Certificate Number', 'First Name', 'Last Name', 'Land Use Type', 'Land Size', 'Unit', 'Region', 'Date Registered', 'Status']];
      tableData = reportData.map(row => [
        row.certificateNumber || '',
        row.firstNameEn || '',
        row.lastNameEn || '',
        row.landUseType || '',
        row.landSize || '',
        row.sizeUnit || '',
        row.regionEn || '',
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
        row.status || ''
      ]);
    }

    doc.autoTable({
      head,
      body: tableData,
      startY: 20,
      margin: { top: 30 },
      didDrawPage: function(data) {
        doc.setFontSize(16);
        doc.text(
          `${reportTypes.find(t => t.value === reportType)?.label || 'Report'}`,
          14,
          15
        );
        if (dateRange.startDate && dateRange.endDate) {
          doc.setFontSize(10);
          doc.text(
            `Period: ${dateRange.startDate} to ${dateRange.endDate}`,
            14,
            22
          );
        }
      },
    });
    doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Function to handle Excel export
  const handleExcelExport = () => {
    if (!reportType || reportData.length === 0) return;
    let exportData = [];
    if (reportType === 'Certificates Issued Report') {
      exportData = reportData.map(row => ({
        'Certificate Number': row.certificateNumber || '',
        'First Name': row.firstNameEn || '',
        'Last Name': row.lastNameEn || '',
        'Land Use Type': row.landUseType || '',
        'Land Size': row.landSize || '',
        'Unit': row.sizeUnit || '',
        'Region': row.regionEn || '',
        'Date Issued': row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
        'Status': row.status || ''
      }));
    } else if (reportType === 'Parcel Management Report') {
      exportData = reportData.map(row => ({
        'Parcel Number': row.parcelNumber || '',
        'Region': row.landLocation?.regionEn || row.regionEn || '',
        'Land Size': row.landSize ?? row.size ?? '',
        'Unit': row.sizeUnit || '',
        'Land Use Type': row.landUseType || '',
        'Date Registered': row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
        'Status': row.status || ''
      }));
    } else if (reportType === 'Land Registration Report') {
      exportData = reportData.map(row => ({
        'Certificate Number': row.certificateNumber || '',
        'First Name': row.firstNameEn || '',
        'Last Name': row.lastNameEn || '',
        'Land Use Type': row.landUseType || '',
        'Land Size': row.landSize || '',
        'Unit': row.sizeUnit || '',
        'Region': row.regionEn || '',
        'Date Registered': row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
        'Status': row.status || ''
      }));
    }
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(
      wb,
      `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Function to handle printing
  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `${reportType}_report_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @media print {
        body { margin: 0; padding: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
      }
    `
  });

  // Component for print layout
  const PrintComponent = React.forwardRef((props, ref) => (
    <div ref={ref} style={{ padding: '20px' }}>
      <h2>{reportTitle || reportType || 'Report'}</h2>
      {dateRange.startDate && dateRange.endDate && (
        <p>Period: {dateRange.startDate} to {dateRange.endDate}</p>
      )}
      <Table>
        <TableHead>
          <TableRow>
            {/* Dynamically render columns based on report type */}
            {reportType === 'Certificates Issued Report' && (
              <>
                <TableCell>Certificate Number</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Land Use Type</TableCell>
                <TableCell>Land Size</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Date Issued</TableCell>
                <TableCell>Status</TableCell>
              </>
            )}
            {reportType === 'Parcel Management Report' && (
              <>
                <TableCell>Parcel Number</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Land Size</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Land Use Type</TableCell>
                <TableCell>Date Registered</TableCell>
                <TableCell>Status</TableCell>
              </>
            )}
            {reportType === 'Land Registration Report' && (
              <>
                <TableCell>Certificate Number</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Land Use Type</TableCell>
                <TableCell>Land Size</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Date Registered</TableCell>
                <TableCell>Status</TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((row, idx) => (
            <TableRow key={row._id || row.certificateNumber || row.parcelNumber || idx}>
              {/* Render row data based on report type */}
              {reportType === 'Certificates Issued Report' && (
                <>
                  <TableCell>{row.certificateNumber}</TableCell>
                  <TableCell>{row.firstNameEn}</TableCell>
                  <TableCell>{row.lastNameEn}</TableCell>
                  <TableCell>{row.landUseType}</TableCell>
                  <TableCell>{row.landSize}</TableCell>
                  <TableCell>{row.sizeUnit}</TableCell>
                  <TableCell>{row.regionEn}</TableCell>
                  <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                  </TableCell>
                </>
              )}
              {reportType === 'Parcel Management Report' && (
                <>
                  <TableCell>{row.parcelNumber}</TableCell>
                  <TableCell>{row.landLocation?.regionEn || row.regionEn || ''}</TableCell>
                  <TableCell>{row.landSize ?? row.size ?? ''}</TableCell>
                  <TableCell>{row.sizeUnit}</TableCell>
                  <TableCell>{row.landUseType}</TableCell>
                  <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                  </TableCell>
                </>
              )}
              {reportType === 'Land Registration Report' && (
                <>
                  <TableCell>{row.certificateNumber}</TableCell>
                  <TableCell>{row.firstNameEn}</TableCell>
                  <TableCell>{row.lastNameEn}</TableCell>
                  <TableCell>{row.landUseType}</TableCell>
                  <TableCell>{row.landSize}</TableCell>
                  <TableCell>{row.sizeUnit}</TableCell>
                  <TableCell>{row.regionEn}</TableCell>
                  <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generate Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Configuration
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                startIcon={<AssessmentIcon />}
                disabled={!reportType}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Preview */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Report Preview
                </Typography>
                <Box>
                  <IconButton 
                    title="Print Report" 
                    onClick={handlePrint}
                    disabled={!reportType || reportData.length === 0}
                  >
                    <PrintIcon />
                  </IconButton>
                  <IconButton 
                    title="Download PDF" 
                    onClick={handlePdfExport}
                    disabled={!reportType || reportData.length === 0}
                  >
                    <PdfIcon />
                  </IconButton>
                  <IconButton 
                    title="Download Excel" 
                    onClick={handleExcelExport}
                    disabled={!reportType || reportData.length === 0}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </Box>

              {loading ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <div ref={tableRef}>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {/* Dynamically render columns based on report type */}
                          {reportType === 'Certificates Issued Report' && (
                            <>
                              <TableCell>Certificate Number</TableCell>
                              <TableCell>First Name</TableCell>
                              <TableCell>Last Name</TableCell>
                              <TableCell>Land Use Type</TableCell>
                              <TableCell>Land Size</TableCell>
                              <TableCell>Unit</TableCell>
                              <TableCell>Region</TableCell>
                              <TableCell>Date Issued</TableCell>
                              <TableCell>Status</TableCell>
                            </>
                          )}
                          {reportType === 'Parcel Management Report' && (
                            <>
                              <TableCell>Parcel Number</TableCell>
                              <TableCell>Region</TableCell>
                              <TableCell>Land Size</TableCell>
                              <TableCell>Unit</TableCell>
                              <TableCell>Land Use Type</TableCell>
                              <TableCell>Date Registered</TableCell>
                              <TableCell>Status</TableCell>
                            </>
                          )}
                          {reportType === 'Land Registration Report' && (
                            <>
                              <TableCell>Certificate Number</TableCell>
                              <TableCell>First Name</TableCell>
                              <TableCell>Last Name</TableCell>
                              <TableCell>Land Use Type</TableCell>
                              <TableCell>Land Size</TableCell>
                              <TableCell>Unit</TableCell>
                              <TableCell>Region</TableCell>
                              <TableCell>Date Registered</TableCell>
                              <TableCell>Status</TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportType && reportData.map((row, idx) => (
                          <TableRow key={row._id || row.certificateNumber || row.parcelNumber || idx}>
                            {/* Render row data based on report type */}
                            {reportType === 'Certificates Issued Report' && (
                              <>
                                <TableCell>{row.certificateNumber}</TableCell>
                                <TableCell>{row.firstNameEn}</TableCell>
                                <TableCell>{row.lastNameEn}</TableCell>
                                <TableCell>{row.landUseType}</TableCell>
                                <TableCell>{row.landSize}</TableCell>
                                <TableCell>{row.sizeUnit}</TableCell>
                                <TableCell>{row.regionEn}</TableCell>
                                <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
                                <TableCell>
                                  <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                                </TableCell>
                              </>
                            )}
                            {reportType === 'Parcel Management Report' && (
                              <>
                                <TableCell>{row.parcelNumber}</TableCell>
                                <TableCell>{row.landLocation?.regionEn || row.regionEn || ''}</TableCell>
                                <TableCell>{row.landSize ?? row.size ?? ''}</TableCell>
                                <TableCell>{row.sizeUnit}</TableCell>
                                <TableCell>{row.landUseType}</TableCell>
                                <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
                                <TableCell>
                                  <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                                </TableCell>
                              </>
                            )}
                            {reportType === 'Land Registration Report' && (
                              <>
                                <TableCell>{row.certificateNumber}</TableCell>
                                <TableCell>{row.firstNameEn}</TableCell>
                                <TableCell>{row.lastNameEn}</TableCell>
                                <TableCell>{row.landUseType}</TableCell>
                                <TableCell>{row.landSize}</TableCell>
                                <TableCell>{row.sizeUnit}</TableCell>
                                <TableCell>{row.regionEn}</TableCell>
                                <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
                                <TableCell>
                                  <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                        {(!reportType || reportData.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              <Typography color="textSecondary">
                                {!reportType 
                                  ? 'Select a report type to view data'
                                  : 'No data found for selected criteria'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}

              {reportType && reportData.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Records: {reportData.length}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add hidden print component */}
      <div style={{ display: 'none' }}>
        <PrintComponent ref={tableRef} />
      </div>
    </Box>
  );
};

export default GenerateReport;