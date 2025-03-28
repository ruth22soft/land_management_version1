import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  QrCode as QrCodeIcon,
  VerifiedUser as VerifiedUserIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import CertificateGenerator from '../certification/CertificateGenerator';

const CertificateVerification = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const videoRef = useRef(null);
  const scannerIntervalRef = useRef(null);

  // Mock verification data - replace with actual API call
  const mockCertificateData = {
    certificateNumber: 'LRMS-2025-123456',
    isValid: true,
    ownerFirstName: 'Abebe',
    ownerLastName: 'Kebede',
    ownerFirstNameAm: 'አበበ',
    ownerLastNameAm: 'ከበደ',
    nationalId: 'ETH123456',
    parcelNumber: 'P001',
    dateOfIssuance: '2025-01-15',
    expirationDate: '2030-01-15',
    landLocation: {
      region: 'Addis Ababa',
      woreda: 'Bole',
      kebele: '05'
    },
    landSize: '500',
    sizeUnit: 'sq meters',
    landUseType: 'Residential',
    boundaries: {
      north: 'Road',
      south: 'P002',
      east: 'P003',
      west: 'Public Park',
    },
    legalRights: {
      en: 'This certificate grants the registered owner the following rights: Right to use the land for the specified purpose...',
      am: 'ይህ የምስክር ወረቀት ለተመዘገበው ባለቤት የሚከተሉትን መብቶች ይሰጣል: መሬቱን ለተገለጸው ዓላማ የመጠቀም መብት...'
    },
    termsAndConditions: {
      en: 'The owner must comply with all local zoning regulations...',
      am: 'ባለቤቱ ከሁሉም የአካባቢ ዞን ደንቦች ጋር መስማማት አለበት...'
    },
    signatures: {
      owner: null,
      registrationOfficer: null
    },
    issuingAuthority: 'Land Registration Authority',
    issuingAuthorityAm: 'የመሬት ምዝገባ ባለስልጣን'
  };

  const handleVerification = async () => {
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Retrieve from localStorage for demo purposes
      const existingRecords = JSON.parse(localStorage.getItem('certificateRecords') || '[]');
      const certificate = existingRecords.find(
        (record) => record.certificateNumber === certificateNumber
      );

      if (certificate) {
        setVerificationResult({
          ...certificate,
          isValid: true
        });
      } else if (certificateNumber === mockCertificateData.certificateNumber) {
        // Use mock data for demo
        setVerificationResult(mockCertificateData);
      } else {
        setError('Certificate not found. Please check the certificate number and try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const startQRScanner = async () => {
    setShowScanner(true);
    setError('');

    try {
      const constraints = { video: { facingMode: 'environment' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            resolve();
          };
        });
        
        // Start playing the video
        videoRef.current.play();
        
        // Set up scanning interval
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        scannerIntervalRef.current = setInterval(() => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            // Set canvas dimensions to match video
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            // Draw current video frame to canvas
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            // Here you would add QR code detection logic
            // For this demo, we'll simulate finding a QR code after a few seconds
            setTimeout(() => {
              if (scannerIntervalRef.current) {
                stopQRScanner();
                setCertificateNumber(mockCertificateData.certificateNumber);
                handleVerification();
              }
            }, 3000);
          }
        }, 500);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure camera permissions are granted.');
      setShowScanner(false);
    }
  };

  const stopQRScanner = () => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setShowScanner(false);
  };

  const viewFullCertificate = () => {
    setShowCertificate(true);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Certificate Verification
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Verify the authenticity of a land registration certificate
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Certificate Number" icon={<SearchIcon />} iconPosition="start" />
          <Tab label="QR Code Scan" icon={<QrCodeIcon />} iconPosition="start" />
        </Tabs>

        {activeTab === 0 && (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleVerification(); }}>
            <TextField
              fullWidth
              label="Certificate Number"
              placeholder="Enter certificate number (e.g., LRMS-2025-123456)"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleVerification}
              disabled={loading || !certificateNumber}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Certificate'}
            </Button>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ textAlign: 'center' }}>
            {!showScanner ? (
              <>
                <Typography variant="body1" gutterBottom>
                  Scan the QR code on the certificate for quick verification
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={startQRScanner}
                  sx={{ mt: 2 }}
                >
                  Start QR Scanner
                </Button>
              </>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <video 
                  ref={videoRef} 
                  style={{ width: '100%', maxHeight: '300px', background: '#000' }}
                ></video>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid #fff', 
                    width: '200px', 
                    height: '200px'
                  }}
                ></Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={stopQRScanner}
                  sx={{ mt: 2 }}
                >
                  Cancel Scan
                </Button>
              </Box>
            )}
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {verificationResult && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VerifiedUserIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" color="success.main">
                Certificate Verified
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Certificate Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Certificate Number</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.certificateNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Owner Name</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {verificationResult.ownerFirstName} {verificationResult.ownerLastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Issue Date</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.dateOfIssuance}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Expiry Date</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.expirationDate || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Land Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Parcel Number</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.parcelNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Location</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {verificationResult.landLocation?.region}, {verificationResult.landLocation?.woreda}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Size</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.landSize} {verificationResult.sizeUnit}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Land Use</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.landUseType}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={viewFullCertificate}
                  sx={{ mt: 2 }}
                >
                  View Full Certificate
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Certificate Preview Dialog */}
      <Dialog
        open={showCertificate}
        onClose={() => setShowCertificate(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Land Registration Certificate
          <IconButton
            onClick={() => setShowCertificate(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {verificationResult && (
            <Box className="certificate-preview" sx={{ p: 2 }}>
              <CertificateGenerator certificateData={verificationResult} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CertificateVerification;
