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
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  VerifiedUser as VerifiedUserIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import CertificateGenerator, { CertificateDocument } from '../certification/CertificateGenerator';

import ownerService from '../../services/ownerService';

// Initial state
const initialOwners = [
  {
    id: 1,
    firstName: 'Abebe',
    lastName: 'Kebede',
    firstNameAm: 'አበበ',
    lastNameAm: 'ከበደ',
    idNumber: 'ETH123456',
    phone: '+251911234567',
    address: 'Addis Ababa',
    addressAm: 'አዲስ አበባ',
    parcels: 2,
    certificateNumber: 'LRMS-2025-123456',
    landLocation: {
      region: 'Addis Ababa',
      woreda: 'Bole',
      kebele: '05'
    },
    landSize: '500',
    sizeUnit: 'sq meters',
    boundaries: {
      north: 'Road',
      south: 'Building',
      east: 'Empty Land',
      west: 'River'
    },
    landUseType: 'Residential',
    landDescription: {
      en: 'Two story residential building with garden',
      am: 'ሁለት ፎቅ የመኖሪያ ቤት ከአትክልት ጋር'
    },
    issuingAuthority: 'Land Registration Authority',
    issuingAuthorityAm: 'የመሬት ምዝገባ ባለስልጣን',
    dateOfIssuance: '2025-01-15',
    regDate: '2025-01-10',
    registrationNumber: 'REG-2025-123456',
    legalRights: {
      en: 'This certificate grants the registered owner the following rights: Right to use the land for the specified purpose...',
      am: 'ይህ የምስክር ወረቀት ለተመዘገበው ባለቤት የሚከተሉትን መብቶች ይሰጣል: መሬቱን ለተገለጸው ዓላማ የመጠቀም መብት...'
    },
    termsAndConditions: {
      en: 'The owner must comply with all local zoning regulations...',
      am: 'ባለቤቱ ከሁሉም የአካባቢ ዞን ደንቦች ጋር መስማማት አለበት...'
    },
    hasExpirationDate: false,
    expirationDate: null
  },
  // Add more mock owners as needed
];

const LandOwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch owners on component mount
  React.useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      try {
        const response = await ownerService.getAllOwners();
        setOwners(response.data.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Error fetching landowners',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOwners();
  }, []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    firstNameAm: '',
    lastNameAm: '',
    idNumber: '',
    phone: '',
    address: '',
    addressAm: '',
    parcels: 0,
    landLocation: {
      region: '',
      woreda: '',
      kebele: ''
    }
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOwner, setMenuOwner] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedCertificateOwner, setSelectedCertificateOwner] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (owner = null) => {
    // Reset form errors when opening dialog
    setFormErrors({});
    
    if (owner) {
      setSelectedOwner(owner);
      setFormData({ ...owner });
    } else {
      setSelectedOwner(null);
      setFormData({
        firstName: '',
        lastName: '',
        firstNameAm: '',
        lastNameAm: '',
        idNumber: '',
        phone: '',
        address: '',
        addressAm: '',
        parcels: 0,
        landLocation: {
          region: '',
          woreda: '',
          kebele: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOwner(null);
  };

  const handleMenuOpen = (event, owner) => {
    setAnchorEl(event.currentTarget);
    setMenuOwner(owner);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOwner(null);
  };

  const handleViewCertificate = () => {
    setSelectedCertificateOwner(menuOwner);
    setShowCertificate(true);
    handleMenuClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const [formErrors, setFormErrors] = useState({});
  const validateForm = () => {
    const errors = {};
    
    // Validate personal information fields
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.idNumber) errors.idNumber = 'ID number is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    try {
      if (selectedOwner) {
        // Update existing owner
        const response = await ownerService.updateProfile(formData);
        setOwners(owners.map(owner => 
          owner.id === selectedOwner.id ? response.data.data : owner
        ));
        setSnackbar({
          open: true,
          message: 'Owner updated successfully',
          severity: 'success'
        });
      } else {
        // Register new owner
        const response = await ownerService.registerOwner(formData);
        setOwners([response.data.data.user, ...owners]);
        setSnackbar({
          open: true,
          message: 'Owner registered successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Error processing owner data',
        severity: 'error'
      });
    }
  };

  const handleDelete = (id) => {
    // Show confirmation dialog in a real application
    setOwners(owners.filter(owner => owner.id !== id));
    setSnackbar({
      open: true,
      message: 'Land owner deleted successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Land Owner Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Land Owner
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Owner Name</TableCell>
              <TableCell>ID Number</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Land Parcels</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {owners
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      {owner.firstName} {owner.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>{owner.idNumber}</TableCell>
                  <TableCell>{owner.phone}</TableCell>
                  <TableCell>{owner.address}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${owner.parcels} parcels`}
                      color={owner.parcels > 0 ? "primary" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(owner)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(owner.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, owner)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={owners.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedOwner ? 'Edit Land Owner' : 'Add New Land Owner'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Personal Information */}
            {/* <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Account Information
              </Typography>
            </Grid> */}
            {/* <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
            </Grid> */}
            {/* <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid> */}
            {/* {!selectedOwner && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </Grid>
            )} */}
            
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name (English)"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name (English)"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name (Amharic)"
                name="firstNameAm"
                value={formData.firstNameAm}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name (Amharic)"
                name="lastNameAm"
                value={formData.lastNameAm}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                required
                error={!!formErrors.idNumber}
                helperText={formErrors.idNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address (English)"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address (Amharic)"
                name="addressAm"
                value={formData.addressAm}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Land Location Information (if needed) */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                Location Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Region"
                name="landLocation.region"
                value={formData.landLocation?.region || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Woreda"
                name="landLocation.woreda"
                value={formData.landLocation?.woreda || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Kebele"
                name="landLocation.kebele"
                value={formData.landLocation?.kebele || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
          >
            {selectedOwner ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certificate Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewCertificate}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Certificate" />
        </MenuItem>
        <MenuItem component={Link} to={`/registration/certificate?id=${menuOwner?.id}`}>
          <ListItemIcon>
            <VerifiedUserIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Generate New Certificate" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Print Details" />
        </MenuItem>
      </Menu>

      {/* Certificate Preview Dialog */}
      {selectedCertificateOwner && (
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
                Certificate Number: {selectedCertificateOwner.certificateNumber || 'N/A'}
              </Typography>
              
              <Box className="certificate-preview">
                <CertificateGenerator certificateData={selectedCertificateOwner} />
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

      {/* Snackbar notifications */}
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
    </Box>
  );
};

export default LandOwnerManagement;
