import React, { useState, useEffect } from 'react';
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
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

// Import the sample data directly
const sampleReports = {
  "landRegistration": [
    {
      "id": "LR001",
      "date": "2024-01-15",
      "reference": "LR-2024-001",
      "type": "New Registration",
      "details": "Land Registration in Addis Ababa",
      "status": "Completed",
      "owner": "Abebe Kebede",
      "location": "Addis Ababa",
      "parcelSize": "200 sq meters"
    },
    {
      "id": "LR002",
      "date": "2024-01-16",
      "reference": "LR-2024-002",
      "type": "Transfer",
      "details": "Property Transfer in Bahir Dar",
      "status": "Pending",
      "owner": "Kebede Alemu",
      "location": "Bahir Dar",
      "parcelSize": "300 sq meters"
    },
    {
      "id": "LR003",
      "date": "2024-01-17",
      "reference": "LR-2024-003",
      "type": "New Registration",
      "details": "Land Registration in Hawassa",
      "status": "Completed",
      "owner": "Almaz Tadesse",
      "location": "Hawassa",
      "parcelSize": "150 sq meters"
    }
  ],
  "certificates": [
    {
      "id": "CERT001",
      "date": "2024-01-15",
      "reference": "CERT-2024-001",
      "type": "Land Title",
      "details": "Certificate issued to Abebe Kebede",
      "status": "Issued",
      "owner": "Abebe Kebede",
      "validUntil": "2029-01-15",
      "certificateType": "Original"
    },
    {
      "id": "CERT002",
      "date": "2024-01-16",
      "reference": "CERT-2024-002",
      "type": "Land Title",
      "details": "Certificate issued to Kebede Alemu",
      "status": "Pending",
      "owner": "Kebede Alemu",
      "validUntil": "2029-01-16",
      "certificateType": "Original"
    },
    {
      "id": "CERT003",
      "date": "2024-01-17",
      "reference": "CERT-2024-003",
      "type": "Land Title",
      "details": "Certificate issued to Almaz Tadesse",
      "status": "Issued",
      "owner": "Almaz Tadesse",
      "validUntil": "2029-01-17",
      "certificateType": "Duplicate"
    }
  ],
  "parcels": [
    {
      "id": "PAR001",
      "date": "2024-01-15",
      "reference": "PAR-2024-001",
      "type": "Residential",
      "details": "Residential Plot in Bole",
      "status": "Active",
      "location": "Bole, Addis Ababa",
      "size": "200 sq meters",
      "owner": "Abebe Kebede"
    },
    {
      "id": "PAR002",
      "date": "2024-01-16",
      "reference": "PAR-2024-002",
      "type": "Commercial",
      "details": "Commercial Plot in Piassa",
      "status": "Active",
      "location": "Piassa, Addis Ababa",
      "size": "500 sq meters",
      "owner": "Kebede Alemu"
    },
    {
      "id": "PAR003",
      "date": "2024-01-17",
      "reference": "PAR-2024-003",
      "type": "Agricultural",
      "details": "Agricultural Land in Sululta",
      "status": "Under Review",
      "location": "Sululta",
      "size": "1000 sq meters",
      "owner": "Almaz Tadesse"
    }
  ]
};

const GenerateReport = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const tableRef = React.useRef(null);

  const reportTypes = [
    { value: 'landRegistration', label: 'Land Registration Report' },
    { value: 'certificates', label: 'Certificates Issued Report' },
    { value: 'parcels', label: 'Parcel Management Report' }
  ];

  // Filter data based on date range
  const getFilteredData = () => {
    if (!reportType) return [];

    const data = sampleReports[reportType];
    if (!dateRange.startDate || !dateRange.endDate) return data;

    return data.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return itemDate >= start && itemDate <= end;
    });
  };

  const getStatusColor = (status) => {
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

  const handleGenerateReport = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Function to handle PDF generation
  const handlePdfExport = () => {
    if (!reportType || getFilteredData().length === 0) return;

    const doc = new jsPDF();
    const tableData = getFilteredData().map(row => [
      row.date,
      row.reference,
      row.type,
      row.details,
      row.status
    ]);

    doc.autoTable({
      head: [['Date', 'Reference', 'Type', 'Details', 'Status']],
      body: tableData,
      startY: 20,
      margin: { top: 30 },
      didDrawPage: function(data) {
        // Add title to the PDF
        doc.setFontSize(16);
        doc.text(
          `${reportTypes.find(t => t.value === reportType)?.label || 'Report'}`,
          14,
          15
        );
        
        // Add date range if specified
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

    // Save the PDF
    doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Function to handle Excel export
  const handleExcelExport = () => {
    if (!reportType || getFilteredData().length === 0) return;

    const ws = XLSX.utils.json_to_sheet(getFilteredData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    
    // Save the Excel file
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
      <h2>{reportTypes.find(t => t.value === reportType)?.label || 'Report'}</h2>
      {dateRange.startDate && dateRange.endDate && (
        <p>Period: {dateRange.startDate} to {dateRange.endDate}</p>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {getFilteredData().map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.reference}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.details}</TableCell>
              <TableCell>{row.status}</TableCell>
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
                    disabled={!reportType || getFilteredData().length === 0}
                  >
                    <PrintIcon />
                  </IconButton>
                  <IconButton 
                    title="Download PDF" 
                    onClick={handlePdfExport}
                    disabled={!reportType || getFilteredData().length === 0}
                  >
                    <PdfIcon />
                  </IconButton>
                  <IconButton 
                    title="Download Excel" 
                    onClick={handleExcelExport}
                    disabled={!reportType || getFilteredData().length === 0}
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
                          <TableCell>Date</TableCell>
                          <TableCell>Reference</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportType && getFilteredData().map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.reference}</TableCell>
                            <TableCell>{row.type}</TableCell>
                            <TableCell>{row.details}</TableCell>
                            <TableCell>
                              <Chip 
                                label={row.status}
                                color={getStatusColor(row.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!reportType || getFilteredData().length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
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

              {reportType && getFilteredData().length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Records: {getFilteredData().length}
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