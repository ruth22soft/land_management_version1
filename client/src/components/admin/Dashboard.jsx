import React from 'react';
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

// Sample data for charts
const monthlyData = [
  { month: 'Jan', registrations: 45, certificates: 38, parcels: 25 },
  { month: 'Feb', registrations: 52, certificates: 42, parcels: 30 },
  { month: 'Mar', registrations: 48, certificates: 35, parcels: 28 },
  { month: 'Apr', registrations: 60, certificates: 50, parcels: 35 },
  { month: 'May', registrations: 55, certificates: 45, parcels: 32 },
  { month: 'Jun', registrations: 65, certificates: 55, parcels: 40 },
];

const parcelTypeData = [
  { name: 'Residential', value: 45, color: '#0088FE' },
  { name: 'Commercial', value: 30, color: '#00C49F' },
  { name: 'Agricultural', value: 15, color: '#FFBB28' },
  { name: 'Industrial', value: 10, color: '#FF8042' },
];

const registrationStatusData = [
  { name: 'Completed', value: 150 },
  { name: 'Pending', value: 30 },
  { name: 'Under Review', value: 20 },
];

const Dashboard = () => {
  // Sample data for stat cards
  const stats = {
    totalCertifications: 150,
    activeParcels: 200,
    registeredUsers: 50,
    monthlyRegistrations: 25,
  };

  // Sample trend data
  const trendStats = [
    {
      title: "Registration Growth",
      value: "+25%",
      subtext: "vs last month",
      trend: "up",
      color: "#4caf50",
      details: "150 new registrations",
      icon: <ShowChart />
    },
    {
      title: "Certificate Processing Time",
      value: "-15%",
      subtext: "processing time",
      trend: "down",
      color: "#2196f3",
      details: "Average 3 days",
      icon: <Timeline />
    },
    {
      title: "Parcel Verification Rate",
      value: "98%",
      subtext: "success rate",
      trend: "up",
      color: "#ff9800",
      details: "High accuracy",
      icon: <Assessment />
    },
    {
      title: "Digital Records",
      value: "12TB",
      subtext: "data stored",
      trend: "up",
      color: "#9c27b0",
      details: "100% backed up",
      icon: <PieChartIcon />
    }
  ];

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

          {/* New Trend Statistics Section */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              {trendStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      height: '100%',
                      background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                      border: `1px solid ${stat.color}30`,
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 4px 20px ${stat.color}30`,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: `${stat.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        {React.cloneElement(stat.icon, { 
                          sx: { color: stat.color, fontSize: 24 } 
                        })}
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        color="textSecondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {stat.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                      <Typography 
                        variant="h4" 
                        component="div"
                        sx={{ 
                          fontWeight: 'bold',
                          color: stat.color
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          ml: 1
                        }}
                      >
                        {stat.trend === 'up' ? (
                          <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />
                        ) : (
                          <TrendingDown sx={{ color: '#f44336', fontSize: 20 }} />
                        )}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            ml: 0.5,
                            color: stat.trend === 'up' ? '#4caf50' : '#f44336'
                          }}
                        >
                          {stat.subtext}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ 
                        mt: 1,
                        fontSize: '0.75rem',
                        opacity: 0.8
                      }}
                    >
                      {stat.details}
                    </Typography>

                    {/* Animated Progress Bar */}
                    <Box
                      sx={{
                        mt: 2,
                        height: 4,
                        bgcolor: `${stat.color}20`,
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: '60%',
                          height: '100%',
                          bgcolor: stat.color,
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.6 }
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
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
                        fill={entry.color}
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
                        backgroundColor: entry.color,
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
