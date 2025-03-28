import React, { useState } from 'react';
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
} from '@mui/icons-material';

// Mock data - replace with actual API calls
const initialCertificates = [
  {
    id: 1,
    certificateNumber: 'CERT2025001',
    ownerName: 'Abebe Kebede',
    parcelNumber: 'P001',
    issueDate: '2025-01-15',
    expiryDate: '2030-01-15',
    status: 'active',
  },
  {
    id: 2,
    certificateNumber: 'CERT2025002',
    ownerName: 'Tigist Alemu',
    parcelNumber: 'P002',
    issueDate: '2025-01-20',
    expiryDate: '2030-01-20',
    status: 'active',
  },
  {
    id: 3,
    certificateNumber: 'CERT2024001',
    ownerName: 'Mohammed Ahmed',
    parcelNumber: 'P003',
    issueDate: '2024-12-10',
    expiryDate: '2029-12-10',
    status: 'expired',
  },
];

const CertificateHistory = () => {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    const filtered = initialCertificates.filter(cert => 
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.parcelNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <TableRow key={certificate.id}>
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
