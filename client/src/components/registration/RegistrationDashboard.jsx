import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Description,
  Map,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {React.cloneElement(icon, { sx: { fontSize: 40, color } })}
      </Box>
      <Typography variant="h5" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const RegistrationDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingParcels: 0,
    completedCertifications: 0,
    activeParcels: 0,
    monthlyRegistrations: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view the dashboard');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/dashboard/registration', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setStats({
          pendingParcels: response.data.pendingParcels || 0,
          completedCertifications: response.data.completedCertifications || 0,
          activeParcels: response.data.activeParcels || 0,
          monthlyRegistrations: response.data.monthlyRegistrations || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          // Optionally redirect to login page
          // navigate('/login');
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleNavigate = (path) => {
    navigate(path);
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
            onClick={() => navigate('/login')}
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
      <Typography variant="h4" gutterBottom>
        Registration Office Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Parcels"
            value={stats.pendingParcels}
            icon={<Assignment />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Certifications"
            value={stats.completedCertifications}
            icon={<Description />}
            color="#43a047"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Parcels"
            value={stats.activeParcels}
            icon={<Map />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Registrations"
            value={stats.monthlyRegistrations}
            icon={<TrendingUp />}
            color="#9c27b0"
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                startIcon={<Description />}
                onClick={() => handleNavigate('/registration/new-certification')}
              >
                New Certification
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Map />}
                onClick={() => handleNavigate('/registration/parcels')}
              >
                Manage Parcels
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography color="text.secondary">
                No recent activities to display
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Pending Parcels */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Parcels
            </Typography>
            <Typography color="text.secondary">
              No pending parcels to display
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegistrationDashboard;
