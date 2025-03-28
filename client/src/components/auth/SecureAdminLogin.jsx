import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  accessCode: yup
    .string()
    .required('Access code is required')
    .min(8, 'Access code must be at least 8 characters'),
});

// In a real application, this would be stored securely on the server
const ADMIN_ACCESS_CODE = 'LRMS1234';

const SecureAdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const formik = useFormik({
    initialValues: {
      accessCode: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (values.accessCode === ADMIN_ACCESS_CODE) {
          navigate('/login/admin');
        } else {
          const remainingAttempts = maxAttempts - (attempts + 1);
          setAttempts(prev => prev + 1);
          
          if (remainingAttempts <= 0) {
            throw new Error('Maximum attempts exceeded. Please contact system administrator.');
          }
          
          throw new Error(`Invalid access code. ${remainingAttempts} attempts remaining.`);
        }
      } catch (err) {
        setError(err.message);
        
        if (attempts + 1 >= maxAttempts) {
          // In a real application, you might want to implement a timeout or require admin intervention
          setTimeout(() => {
            navigate('/login/registration');
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Administrator Access
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Please enter your administrator access code to proceed
        </Typography>

        <Card sx={{ width: '100%' }}>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="accessCode"
                name="accessCode"
                label="Access Code"
                type="password"
                value={formik.values.accessCode}
                onChange={formik.handleChange}
                error={formik.touched.accessCode && Boolean(formik.errors.accessCode)}
                helperText={formik.touched.accessCode && formik.errors.accessCode}
                disabled={loading || attempts >= maxAttempts}
                margin="normal"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || attempts >= maxAttempts}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Verify Access'
                )}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login/registration')}
                sx={{ mt: 1 }}
              >
                Back to Registration Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SecureAdminLogin;
