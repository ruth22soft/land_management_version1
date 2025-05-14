import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  Description,
  People,
  Map,
  TrendingUp,
  TrendingDown,
  Timeline,
  Assessment,
  ShowChart,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import AuthContext from '../../context/AuthContext';
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

const Dashboard = () => {
  // State for stats and charts
  const [stats, setStats] = useState({
    totalCertifications: 0,
    activeParcels: 0,
    registeredUsers: 0,
    monthlyRegistrations: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [parcelTypeData, setParcelTypeData] = useState([]);
  const [registrationStatusData, setRegistrationStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Get JWT token from AuthContext or localStorage
    let token = null;
    if (user && user.token) {
      token = user.token;
    } else {
      token = localStorage.getItem('token');
    }
    const headers = token
      ? { 'Authorization': `Bearer ${token}` }
      : {};
    // Fetch all dashboard data in parallel with Authorization header
    Promise.all([
      fetch('/api/dashboard/admin', { headers, credentials: 'include' }).then(res => res.json()),
      fetch('/api/dashboard/monthly-activity', { headers, credentials: 'include' }).then(res => res.json()),
      fetch('/api/dashboard/parcel-types', { headers, credentials: 'include' }).then(res => res.json()),
    ])
      .then(([adminData, monthly, parcelTypes]) => {
        // Stat cards
        setStats({
          totalCertifications: adminData.totalCertifications || adminData.totalCertificates || 0,
          activeParcels: adminData.activeParcels || adminData.totalParcels || 0,
          registeredUsers: adminData.registeredUsers || adminData.totalUsers || 0,
          monthlyRegistrations: adminData.monthlyRegistrations || 0,
        });
        // Monthly trends
        setMonthlyData(Array.isArray(monthly) ? monthly : []);
        // Parcel type distribution
        setParcelTypeData(Array.isArray(parcelTypes) ? parcelTypes : []);
        // Registration status (if available)
        if (Array.isArray(adminData.registrationStatus)) {
          setRegistrationStatusData(
            adminData.registrationStatus.map(item => ({
              name: item._id || 'Unknown',
              value: item.count || 0,
            }))
          );
        } else {
          setRegistrationStatusData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load dashboard data.');
        setLoading(false);
      });
  }, [user]);

  // Custom render for pie chart labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading dashboard...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Certifications"
            value={stats.totalCertifications}
            icon={<Description />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Parcels"
            value={stats.activeParcels}
            icon={<Map />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registered Users"
            value={stats.registeredUsers}
            icon={<People />}
            color="#ed6c02"
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

        {/* Monthly Trends Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Activity Trends
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#1976d2" 
                  name="Land Registrations"
                />
                <Line 
                  type="monotone" 
                  dataKey="certificates" 
                  stroke="#2e7d32" 
                  name="Certificates Issued"
                />
                <Line 
                  type="monotone" 
                  dataKey="parcels" 
                  stroke="#ed6c02" 
                  name="Parcels Registered"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribution Charts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Parcel Type Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={parcelTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {parcelTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || '#1976d2'}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} parcels`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                mt: 2
              }}>
                {parcelTypeData.map((entry, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: entry.color || '#1976d2',
                        borderRadius: '50%'
                      }} 
                    />
                    <Typography variant="body2">
                      {entry.name} ({entry.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
          {/* Registration Status Chart */}
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Registration Status
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart 
                  data={registrationStatusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2">
                    {registrationStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={
                          index === 0 ? '#4caf50' :  // Completed - Green
                          index === 1 ? '#ff9800' :  // Pending - Orange
                          '#f44336'                  // Under Review - Red
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
