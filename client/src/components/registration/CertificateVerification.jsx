import React, { useState, useRef, useEffect } from 'react';
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
import { Html5QrcodeScanner } from 'html5-qrcode';
import CertificateGenerator from '../certification/CertificateGenerator';
import axios from 'axios';

const CertificateVerification = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const scannerRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const handleVerification = async () => {
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await axios.get(`/api/certificates/verify/${certificateNumber}`);
      console.log('Verification Response:', response.data); // Debug log

      if (response.data.success && response.data.data) {
        setVerificationResult(response.data.data);
      } else {
        setError('Certificate not found. Please check the certificate number and try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      startQRScanner();
    } else {
      stopQRScanner();
    }
  };

  const startQRScanner = () => {
    setShowScanner(true);
    setError('');

    // Wait for the DOM to update and element to be available
    setTimeout(() => {
      if (!scannerRef.current) {
        const qrReaderElement = document.getElementById('qr-reader');
        if (qrReaderElement) {
          scannerRef.current = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 2,
            },
            false
          );

          scannerRef.current.render(onScanSuccess, onScanFailure);
        } else {
          console.error('QR reader element not found');
          setError('Failed to initialize QR scanner. Please try again.');
          setShowScanner(false);
        }
      }
    }, 100);
  };

  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setShowScanner(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      // Stop the scanner after successful scan
      stopQRScanner();
      
      // Set the scanned certificate number
      setCertificateNumber(decodedText);
      
      // Verify the certificate
      await handleVerification();
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Error processing QR code. Please try again.');
    }
  };

  const onScanFailure = (error) => {
    // Handle scan failure silently
    console.warn('QR Code scan failed:', error);
  };

  const viewFullCertificate = () => {
    setShowCertificate(true);
  };

  // Cleanup scanner on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopQRScanner();
      }
    };
  }, []);

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
              <Box sx={{ position: 'relative', width: '100%', maxWidth: '500px', mx: 'auto' }}>
                <div id="qr-reader" style={{ width: '100%' }}></div>
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
              <VerifiedUserIcon color={verificationResult.status === 'expired' ? 'error' : 'success'} sx={{ mr: 1 }} />
              <Typography variant="h6" color={verificationResult.status === 'expired' ? 'error.main' : 'success.main'}>
                Certificate {verificationResult.status === 'expired' ? 'Expired' : 'Verified'}
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
                    <Typography color="text.secondary">Registration Number</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.registrationNumber}</Typography>
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
                    <Typography color="text.secondary">Owner Name (Amharic)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {verificationResult.ownerFirstNameAm} {verificationResult.ownerLastNameAm}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">National ID</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{verificationResult.nationalId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Issue Date</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{formatDate(verificationResult.dateOfIssuance)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Expiry Date</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{formatDate(verificationResult.expirationDate)}</Typography>
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
                      {verificationResult.landLocation?.kebele && `, Kebele ${verificationResult.landLocation.kebele}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Location (Amharic)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {verificationResult.landLocation?.regionAm}, {verificationResult.landLocation?.woredaAm}
                      {verificationResult.landLocation?.kebeleAm && `, ቀበሌ ${verificationResult.landLocation.kebeleAm}`}
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
                    <Typography>
                      {verificationResult.landUseType}
                      {verificationResult.landUseTypeAm && ` (${verificationResult.landUseTypeAm})`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Issuing Authority</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {verificationResult.issuingAuthority}
                      {verificationResult.issuingAuthorityAm && ` (${verificationResult.issuingAuthorityAm})`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Registration Officer</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {verificationResult.registrationOfficer}
                      {verificationResult.registrationOfficerAm && ` (${verificationResult.registrationOfficerAm})`}
                    </Typography>
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
