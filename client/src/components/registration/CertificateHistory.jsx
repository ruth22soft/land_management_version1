import React, { useState, useEffect} from 'react';
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

  // Helper to map backend fields to frontend fields
  const mapCertificate = (cert) => ({
    certificateNumber: cert.certificateNumber || cert.certificate_number || '',
    ownerName: (cert.firstNameEn && cert.lastNameEn)
      ? `${cert.firstNameEn} ${cert.lastNameEn}`
      : (cert.firstNameAm && cert.lastNameAm)
        ? `${cert.firstNameAm} ${cert.lastNameAm}`
        : cert.ownerName || cert.owner_name || cert.owner?.name || '',
    parcelNumber: cert.parcelNumber || cert.parcel_number || cert.parcelNo || '',
    issueDate: cert.issueDate || cert.issue_date || cert.dateOfIssuance || cert.issuanceDate || '',
    expiryDate: cert.expiryDate || cert.expiry_date || cert.expirationDate || '',
    status: cert.status || '',
    _id: cert._id || cert.id,
    // ...add more fields as needed
  });

  // Fetch certificates from backend
  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/certificates', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      console.log('Fetched certificates:', data); // Debug log
      if (data.success) {
        const mapped = data.data.map(mapCertificate);
        setAllCertificates(mapped);
        setCertificates(mapped);
      } else {
        setAllCertificates([]);
        setCertificates([]);
      }
    } catch (err) {
      setAllCertificates([]);
      setCertificates([]);
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
    switch (status) {
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

  const generateVerificationURL = (id) => {
    // Replace with actual URL generation logic
    return `https://example.com/verify/${id}`;
  };

  // Delete certificate handler
  const handleDeleteCertificate = async (certificateId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        // Remove the deleted certificate from the list
        setCertificates((prev) => prev.filter(cert => cert._id !== certificateId));
      } else {
        alert(data.message || 'Failed to delete certificate.');
      }
    } catch (err) {
      alert('Failed to delete certificate.');
    }
  };

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
                    <TableCell>{certificate.issueDate}</TableCell>
                    <TableCell>{certificate.expiryDate}</TableCell>
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
                        onClick={() => {/* Add download logic */}}
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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Certificate Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedCertificate && (
            <Grid container spacing={3}>
              <Grid item xs={8}>
                <Typography variant="subtitle1" gutterBottom>
                  Certificate Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Typography color="text.secondary">Certificate Number:</Typography>
                  <Typography>{selectedCertificate.certificateNumber}</Typography>
                  
                  <Typography color="text.secondary">Owner Name:</Typography>
                  <Typography>{selectedCertificate.ownerName}</Typography>
                  
                  <Typography color="text.secondary">Parcel Number:</Typography>
                  <Typography>{selectedCertificate.parcelNumber}</Typography>
                  
                  <Typography color="text.secondary">Issue Date:</Typography>
                  <Typography>{selectedCertificate.issueDate}</Typography>
                  
                  <Typography color="text.secondary">Expiry Date:</Typography>
                  <Typography>{selectedCertificate.expiryDate}</Typography>
                  
                  <Typography color="text.secondary">Status:</Typography>
                  <Chip
                    label={selectedCertificate.status}
                    color={getStatusColor(selectedCertificate.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Certificate History
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <HistoryIcon />
                    <Typography>No previous versions found</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Scan QR Code to Verify
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${generateVerificationURL(selectedCertificate.id)}`} alt="QR Code" />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Verification URL will be valid indefinitely
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {/* Add download logic */}}
          >
            Download Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificateHistory;
