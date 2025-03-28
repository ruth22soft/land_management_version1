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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Typography,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  VerifiedUser as VerifiedUserIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import CertificateGenerator from '../certification/CertificateGenerator';

const initialParcels = [
  {
    id: 1,
    parcelNumber: 'P001',
    location: 'Addis Ababa',
    size: 500,
    ownerName: 'Abebe Kebede',
    landUseType: 'Residential',
    certificateNumber: 'LRMS-2025-123456',
    boundaries: {
      north: 'Road',
      south: 'Building',
      east: 'Empty Land',
      west: 'River'
    },
    legalRights: {
      en: 'This certificate grants the registered owner the following rights...',
      am: 'ይህ የምስክር ወረቀት ለተመዘገበው ባለቤት የሚከተሉትን መብቶች ይሰጣል...'
    },
    termsAndConditions: {
      en: 'The owner must comply with all local zoning regulations...',
      am: 'ባለቤቱ ከሁሉም የአካባቢ ዞን ደንቦች ጋር መስማማት አለበት...'
    },
    issuingAuthority: 'Land Registration Authority',
    issuingAuthorityAm: 'የመሬት ምዝገባ ባለስልጣን',
    dateOfIssuance: '2025-01-15'
  }
];

const ParcelManagement = () => {
  const [parcels, setParcels] = useState(initialParcels);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [formData, setFormData] = useState({
    parcelNumber: '',
    location: '',
    size: '',
    ownerName: '',
    landUseType: '',
    certificateNumber: '',
    boundaries: {
      north: '',
      south: '',
      east: '',
      west: ''
    }
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuParcel, setMenuParcel] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedCertificateParcel, setSelectedCertificateParcel] = useState(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleGenerateCertificate = (parcel) => {
    // Generate certificate number if not exists
    const certificateNumber = parcel.certificateNumber || `LRMS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Prepare complete certificate data with proper image handling
    const certificateData = {
      certificateNumber,
      ownerName: parcel.ownerName,
      nationalId: parcel.nationalId || 'N/A',
      landLocation: {
        region: parcel.location,
        zone: parcel.zone || 'N/A',
        woreda: parcel.woreda || 'N/A',
        kebele: parcel.kebele || 'N/A',
        block: parcel.block || 'N/A'
      },
      landSize: parcel.size,
      sizeUnit: 'square meters',
      landUseType: parcel.landUseType,
      boundaries: parcel.boundaries,
      legalRights: parcel.legalRights,
      termsAndConditions: parcel.termsAndConditions,
      issuingAuthority: parcel.issuingAuthority,
      issuingAuthorityAm: parcel.issuingAuthorityAm,
      dateOfIssuance: parcel.dateOfIssuance || new Date().toISOString().split('T')[0],
      // Add image properties
      ownerPhoto: parcel.ownerPhoto,
      officerSignature: parcel.officerSignature,
      logo: parcel.logo
    };

    // Update parcel with certificate number if needed
    if (!parcel.certificateNumber) {
      const updatedParcels = parcels.map(p => 
        p.id === parcel.id ? { ...p, certificateNumber } : p
      );
      setParcels(updatedParcels);
    }

    setSelectedCertificateParcel(certificateData);
    setCertificateDialogOpen(true);
  };

  const handleCloseCertificateDialog = () => {
    setCertificateDialogOpen(false);
    setSelectedCertificateParcel(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (parcel = null) => {
    if (parcel) {
      setSelectedParcel(parcel);
      setFormData(parcel);
    } else {
      setSelectedParcel(null);
      setFormData({
        parcelNumber: '',
        location: '',
        size: '',
        ownerName: '',
        landUseType: '',
        certificateNumber: '',
        boundaries: {
          north: '',
          south: '',
          east: '',
          west: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedParcel(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('boundaries.')) {
      const boundaryKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        boundaries: {
          ...prev.boundaries,
          [boundaryKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = () => {
    if (selectedParcel) {
      // Update existing parcel
      setParcels(parcels.map((p) => 
        p.id === selectedParcel.id ? { ...formData, id: p.id } : p
      ));
    } else {
      // Add new parcel
      setParcels([...parcels, { ...formData, id: parcels.length + 1 }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setParcels(parcels.filter((p) => p.id !== id));
  };

  const handleViewCertificate = (parcel) => {
    setSelectedCertificateParcel(parcel);
    setShowCertificate(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Parcel Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Parcel
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parcel Number</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Size (m²)</TableCell>
              <TableCell>Owner Name</TableCell>
              <TableCell>Land Use Type</TableCell>
              <TableCell>Certificate Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parcels
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((parcel) => (
                <TableRow key={parcel.id}>
                  <TableCell>{parcel.parcelNumber}</TableCell>
                  <TableCell>{parcel.location}</TableCell>
                  <TableCell>{parcel.size}</TableCell>
                  <TableCell>{parcel.ownerName}</TableCell>
                  <TableCell>{parcel.landUseType}</TableCell>
                  <TableCell>{parcel.certificateNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(parcel)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(parcel.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      onClick={() => handleViewCertificate(parcel)}
                    >
                      <AssignmentIcon />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={() => handleGenerateCertificate(parcel)}
                      title="Generate Certificate"
                    >
                      <VerifiedUserIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={parcels.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedParcel ? 'Edit Parcel' : 'Add New Parcel'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="parcelNumber"
              label="Parcel Number"
              value={formData.parcelNumber}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="size"
              label="Size (m²)"
              type="number"
              value={formData.size}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="ownerName"
              label="Owner Name"
              value={formData.ownerName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="landUseType"
              label="Land Use Type"
              value={formData.landUseType}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="certificateNumber"
              label="Certificate Number"
              value={formData.certificateNumber}
              onChange={handleInputChange}
              fullWidth
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" component="h3">
                Boundaries
              </Typography>
              <TextField
                name="boundaries.north"
                label="North"
                value={formData.boundaries.north}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                name="boundaries.south"
                label="South"
                value={formData.boundaries.south}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                name="boundaries.east"
                label="East"
                value={formData.boundaries.east}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                name="boundaries.west"
                label="West"
                value={formData.boundaries.west}
                onChange={handleInputChange}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedParcel ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedCertificateParcel && (
        <Dialog
          open={showCertificate}
          onClose={() => setShowCertificate(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Land Registration Certificate
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Certificate Number: {selectedCertificateParcel.certificateNumber || 'N/A'}
              </Typography>
              
              <Box className="certificate-preview">
                <CertificateGenerator certificateData={selectedCertificateParcel} />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCertificate(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Certificate Generation Dialog */}
      <Dialog
        open={certificateDialogOpen}
        onClose={handleCloseCertificateDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Land Registration Certificate
          <IconButton
            aria-label="close"
            onClick={handleCloseCertificateDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedCertificateParcel && (
            <Box sx={{ mt: 2 }}>
              <CertificateGenerator 
                certificateData={selectedCertificateParcel}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ParcelManagement;
