import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  Description,
  Map,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  
  // Sample data - replace with actual data from your backend
  const stats = {
    pendingCertifications: 15,
    completedCertifications: 85,
    activeParcels: 120,
    monthlyRegistrations: 25,
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registration Office Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Certifications"
            value={stats.pendingCertifications}
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
              {/* Add your recent activity list here */}
              <Typography color="text.secondary">
                No recent activities to display
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Pending Certifications */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Certifications
            </Typography>
            {/* Add your certifications table or list here */}
            <Typography color="text.secondary">
              No pending certifications to display
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegistrationDashboard;
