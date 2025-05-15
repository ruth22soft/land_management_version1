import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const CertificateHistory = () => {
  const [allCertificates, setAllCertificates] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to map backend fields to frontend fields
  const mapCertificate = (cert) => ({
    certificateNumber: cert.certificateNumber || cert.certificate_number || '',
    ownerName: (cert.ownerFirstName && cert.ownerLastName)
      ? `${cert.ownerFirstName} ${cert.ownerLastName}`
      : (cert.ownerNameAm && cert.ownerNameAm)
        ? `${cert.ownerNameAm.firstName} ${cert.ownerNameAm.lastName}`
        : cert.ownerName || cert.owner_name || cert.owner?.name || '',
    parcelNumber: cert.parcelNumber || cert.parcel_number || cert.parcelNo || '',
    issueDate: cert.issueDate || cert.issue_date || cert.dateOfIssuance || cert.issuanceDate || '',
    expiryDate: cert.expiryDate || cert.expiry_date || cert.expirationDate || '',
    status: cert.status || '',
    _id: cert._id || cert.id,
    landLocation: cert.landLocation || {},
    landSize: cert.landSize || '',
    sizeUnit: cert.sizeUnit || '',
    landUseType: cert.landUseType || '',
    documentPaths: cert.documentPaths || [],
  });

  // Fetch certificates from backend
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view certificates');
        return;
      }

      const response = await fetch('/api/certificates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const mapped = data.data.map(mapCertificate);
        setAllCertificates(mapped);
        setCertificates(mapped);
      } else {
        setError(data.message || 'Failed to fetch certificates');
        setAllCertificates([]);
        setCertificates([]);
      }
    } catch (err) {
      setError('Failed to fetch certificates');
      setAllCertificates([]);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    const filtered = allCertificates.filter(cert =>
      (cert.certificateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.parcelNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCertificates(filtered);
  };

  const handleViewDetails = (certificate) => {
    setSelectedCertificate(certificate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCertificate(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to download certificates');
        return;
      }

      // If the certificate has document paths, download the first document
      if (certificate.documentPaths && certificate.documentPaths.length > 0) {
        const response = await fetch(`/api/certificates/${certificate._id}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-${certificate.certificateNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          alert('Failed to download certificate');
        }
      } else {
        alert('No certificate document available for download');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  // Delete certificate handler
  const handleDeleteCertificate = async (certificateId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCertificates((prev) => prev.filter(cert => cert._id !== certificateId));
        setAllCertificates((prev) => prev.filter(cert => cert._id !== certificateId));
      } else {
        alert(data.message || 'Failed to delete certificate');
      }
    } catch (err) {
      alert('Failed to delete certificate');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        {error.includes('log in') && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.href = '/login'}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Certificate History
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by certificate number, owner name, or parcel number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
          >
            Search
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certificate Number</TableCell>
                <TableCell>Owner Name</TableCell>
                <TableCell>Parcel Number</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((certificate) => (
                  <TableRow key={certificate._id}>
                    <TableCell>{certificate.certificateNumber}</TableCell>
                    <TableCell>{certificate.ownerName}</TableCell>
                    <TableCell>{certificate.parcelNumber}</TableCell>
                    <TableCell>{new Date(certificate.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(certificate.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={certificate.status}
                        color={getStatusColor(certificate.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(certificate)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleDownloadCertificate(certificate)}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteCertificate(certificate._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={certificates.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>

      {/* Certificate Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Certificate Details
        </DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Certificate Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Certificate Number</Typography>
                    <Typography>{selectedCertificate.certificateNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip
                      label={selectedCertificate.status}
                      color={getStatusColor(selectedCertificate.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Owner Name</Typography>
                    <Typography>{selectedCertificate.ownerName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Parcel Number</Typography>
                    <Typography>{selectedCertificate.parcelNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Issue Date</Typography>
                    <Typography>{new Date(selectedCertificate.issueDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Expiry Date</Typography>
                    <Typography>{new Date(selectedCertificate.expiryDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Land Location</Typography>
                    <Typography>{selectedCertificate.landLocation?.region || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Land Size</Typography>
                    <Typography>{selectedCertificate.landSize} {selectedCertificate.sizeUnit}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Land Use Type</Typography>
                    <Typography>{selectedCertificate.landUseType}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Download Options
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadCertificate(selectedCertificate)}
                    >
                      Download Certificate
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificateHistory;
