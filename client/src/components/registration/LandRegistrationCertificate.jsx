import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  PhotoCamera,
  Preview as PreviewIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import CertificateGenerator, { CertificateDocument } from '../certification/CertificateGenerator';

const LandRegistrationCertificate = () => {
  const [formData, setFormData] = useState({
    // Landowner Information
    ownerFirstName: '',
    ownerLastName: '',
    nationalId: '',
    phone: '',
    address: '',
    
    // Land Description
    landLocation: {
      region: '',
      woreda: '',
      kebele: '',
    },
    landSize: '',
    sizeUnit: 'hectares',
    boundaries: {
      north: '',
      south: '',
      east: '',
      west: '',
    },
    
    // Land Use Type
    landUseType: '',
    
    // Certificate Details
    certificateNumber: `LRMS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`, // Auto-generated
    issuingAuthority: '',
    issuingAuthorityAm: 'የመሬት ምዝገባ ባለስልጣን',
    dateOfIssuance: new Date().toISOString().split('T')[0], // Today's date
    
    // Legal Rights and Terms
    legalRights: {
      en: '',
      am: ''
    },
    termsAndConditions: {
      en: '',
      am: ''
    },
    
    // Photographic Evidence
    photographs: [],
    
    // Endorsements/Signatures
    signatures: {
      registrationOfficer: '',
      witness1: {
        name: '',
        signature: '',
      },
      witness2: {
        name: '',
        signature: '',
      }
    },
    
    // Additional Information
    remarks: ''
  });

  const [showCertificate, setShowCertificate] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeCertificateTab, setActiveCertificateTab] = useState('preview');

  const landUseTypes = [
    'Agricultural',
    'Residential',
    'Commercial',
    'Industrial',
    'Mixed Use',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      photographs: [...prev.photographs, ...files]
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Certificate form submitted:', formData);
    
    // Generate QR Code before showing certificate
    generateQRCode();
    
    // Show certificate preview
    setShowCertificate(true);
  };

  const handleReset = () => {
    setFormData({
      ownerFirstName: '',
      ownerLastName: '',
      nationalId: '',
      phone: '',
      address: '',
      landLocation: {
        region: '',
        woreda: '',
        kebele: '',
      },
      landSize: '',
      sizeUnit: 'hectares',
      boundaries: {
        north: '',
        south: '',
        east: '',
        west: '',
      },
      landUseType: '',
      certificateNumber: `LRMS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      issuingAuthority: '',
      issuingAuthorityAm: 'የመሬት ምዝገባ ባለስልጣን',
      dateOfIssuance: new Date().toISOString().split('T')[0],
      legalRights: {
        en: '',
        am: ''
      },
      termsAndConditions: {
        en: '',
        am: ''
      },
      photographs: [],
      signatures: {
        registrationOfficer: '',
        witness1: {
          name: '',
          signature: '',
        },
        witness2: {
          name: '',
          signature: '',
        }
      },
      remarks: ''
    });
  };

  // Function to handle generating QR code for certificate
  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        certificateNumber: formData.certificateNumber,
        ownerName: `${formData.ownerFirstName} ${formData.ownerLastName}`,
        nationalId: formData.nationalId,
        issueDate: formData.dateOfIssuance
      });
      const url = await QRCode.toDataURL(qrData);
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  // Function to download certificate as an image
  const handleCertificateImageDownload = () => {
    // Create a reference to the certificate preview element
    const certificateElement = document.querySelector('.certificate-preview');
    
    if (!certificateElement) {
      alert('Certificate preview not found. Please try again.');
      return;
    }
    
    // Use html2canvas to capture the certificate as an image
    import('html2canvas').then(html2canvas => {
      html2canvas.default(certificateElement).then(canvas => {
        // Create a download link for the image
        const link = document.createElement('a');
        link.download = `land-certificate-${formData.certificateNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error('Error generating certificate image:', err);
        alert('Failed to generate certificate image. Please try again.');
      });
    });
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Land Registration Certificate
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          {/* Landowner Information */}
          <Typography variant="h6" gutterBottom color="primary">
            1. Landowner Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="ownerFirstName"
                value={formData.ownerFirstName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="ownerLastName"
                value={formData.ownerLastName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="National ID"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                required
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>

          {/* Land Description */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="primary">
            2. Land Description
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Region"
                name="landLocation.region"
                value={formData.landLocation.region}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Woreda"
                name="landLocation.woreda"
                value={formData.landLocation.woreda}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Kebele"
                name="landLocation.kebele"
                value={formData.landLocation.kebele}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Land Size"
                name="landSize"
                type="number"
                value={formData.landSize}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Size Unit</InputLabel>
                <Select
                  name="sizeUnit"
                  value={formData.sizeUnit}
                  label="Size Unit"
                  onChange={handleInputChange}
                >
                  <MenuItem value="hectares">Hectares</MenuItem>
                  <MenuItem value="acres">Acres</MenuItem>
                  <MenuItem value="squareMeters">Square Meters</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Boundaries */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Boundaries
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="North Boundary"
                name="boundaries.north"
                value={formData.boundaries.north}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="South Boundary"
                name="boundaries.south"
                value={formData.boundaries.south}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="East Boundary"
                name="boundaries.east"
                value={formData.boundaries.east}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="West Boundary"
                name="boundaries.west"
                value={formData.boundaries.west}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>

          {/* Land Use Type */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="primary">
            3. Land Use Type
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Land Use Type</InputLabel>
                <Select
                  name="landUseType"
                  value={formData.landUseType}
                  label="Land Use Type"
                  onChange={handleInputChange}
                  required
                >
                  {landUseTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Certificate Details */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="primary">
            4. Certificate Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Certificate Number"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Issuing Authority"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Date of Issuance"
                name="dateOfIssuance"
                value={formData.dateOfIssuance}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>

          {/* Legal Rights and Terms */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="primary">
            5. Legal Rights and Terms
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Legal Rights (English)"
                name="legalRights.en"
                value={formData.legalRights.en}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                placeholder="Statement of rights including usage, transfer, and inheritance rights"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Legal Rights (Amharic)"
                name="legalRights.am"
                value={formData.legalRights.am}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                placeholder="Statement of rights including usage, transfer, and inheritance rights"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Terms and Conditions (English)"
                name="termsAndConditions.en"
                value={formData.termsAndConditions.en}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                placeholder="Specific conditions or restrictions related to land use"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Terms and Conditions (Amharic)"
                name="termsAndConditions.am"
                value={formData.termsAndConditions.am}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                placeholder="Specific conditions or restrictions related to land use"
              />
            </Grid>
          </Grid>

          {/* Photo Upload Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="primary">
            6. Photographic Evidence
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                multiple
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<PhotoCamera />}
                >
                  Upload Photos
                </Button>
              </label>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.photographs.map((photo, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(photo)}
                    alt={`Land photo ${index + 1}`}
                    style={{ width: 200, height: 150, objectFit: 'cover' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Signatures Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="primary">
            7. Endorsements & Signatures
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration Officer Name"
                name="signatures.registrationOfficer"
                value={formData.signatures.registrationOfficer}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Witness 1 Name"
                name="signatures.witness1.name"
                value={formData.signatures.witness1.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Witness 1 Signature"
                name="signatures.witness1.signature"
                value={formData.signatures.witness1.signature}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Witness 2 Name"
                name="signatures.witness2.name"
                value={formData.signatures.witness2.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Witness 2 Signature"
                name="signatures.witness2.signature"
                value={formData.signatures.witness2.signature}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="primary">
            8. Additional Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Any additional notes or remarks"
              />
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Generate Certificate
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Certificate Preview Dialog */}
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
              Certificate Number: {formData.certificateNumber}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Please review the certificate details before proceeding.
            </Typography>
            
            {/* Certificate Format Options */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, mt: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Button 
                startIcon={<PreviewIcon />}
                onClick={() => setActiveCertificateTab('preview')}
                sx={{ 
                  color: activeCertificateTab === 'preview' ? 'primary.main' : 'text.secondary',
                  borderBottom: activeCertificateTab === 'preview' ? '2px solid' : 'none',
                  borderRadius: 0,
                  pb: 1
                }}
              >
                Preview
              </Button>
              <Button 
                startIcon={<PdfIcon />}
                onClick={() => setActiveCertificateTab('pdf')}
                sx={{ 
                  color: activeCertificateTab === 'pdf' ? 'primary.main' : 'text.secondary',
                  borderBottom: activeCertificateTab === 'pdf' ? '2px solid' : 'none',
                  borderRadius: 0,
                  pb: 1
                }}
              >
                PDF
              </Button>
              <Button 
                startIcon={<ImageIcon />}
                onClick={() => setActiveCertificateTab('image')}
                sx={{ 
                  color: activeCertificateTab === 'image' ? 'primary.main' : 'text.secondary',
                  borderBottom: activeCertificateTab === 'image' ? '2px solid' : 'none',
                  borderRadius: 0,
                  pb: 1
                }}
              >
                Image
              </Button>
            </Box>
            
            {activeCertificateTab === 'preview' && (
              <Box className="certificate-preview">
                <CertificateGenerator certificateData={formData} qrCodeUrl={qrCodeUrl} />
              </Box>
            )}
            
            {activeCertificateTab === 'pdf' && (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Download PDF Certificate
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Click the button below to download your certificate as a PDF document.
                </Typography>
                <PDFDownloadLink
                  document={<CertificateDocument certificateData={formData} qrCodeUrl={qrCodeUrl} />}
                  fileName={`land-certificate-${formData.certificateNumber}.pdf`}
                  style={{ textDecoration: 'none' }}
                >
                  {({ blob, url, loading, error }) => (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={<DownloadIcon />}
                      size="large"
                    >
                      {loading ? 'Generating PDF...' : 'Download PDF Certificate'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </Box>
            )}
            
            {activeCertificateTab === 'image' && (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Download Certificate as Image
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Click the button below to download your certificate as an image file.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleCertificateImageDownload}
                  size="large"
                >
                  Download as Image
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowCertificate(false)} 
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LandRegistrationCertificate;
