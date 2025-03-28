import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Description,
  People,
  Map,
  Assignment,
  Assessment,
  Logout,
  VerifiedUser,
  History,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const getMenuItems = (userType) => {
  if (userType === 'admin') {
    return [
      { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
      { text: 'User Management', icon: <People />, path: '/admin/users' },
      { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
    ];
  }
  return [
    { text: 'Dashboard', icon: <Dashboard />, path: '/registration/dashboard' },
    { text: 'New Certification', icon: <Description />, path: '/registration/new-certification' },
    { text: 'Land Owners', icon: <People />, path: '/registration/land-owners' },
    { text: 'Parcel Management', icon: <Map />, path: '/registration/parcels' },
    { text: 'Verify Certificate', icon: <VerifiedUser />, path: '/registration/verify-certificate' },
    { text: 'Certificate History', icon: <History />, path: '/registration/certificate-history' },
  ];
};

const MainLayout = ({ userType }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = getMenuItems(userType);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login/' + userType);
  };

  const drawer = (
    <Box sx={{ mt: 2 }}>
      {/* User Info */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64, 
            margin: '0 auto',
            bgcolor: theme.palette.primary.main 
          }}
        >
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {user?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.role === 'admin' ? 'Administrator' : 'Registration Officer'}
        </Typography>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : undefined }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {userType === 'admin' ? 'Admin Panel' : 'Registration Office'}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
