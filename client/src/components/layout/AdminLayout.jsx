import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  // ... other imports
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AdminLayout = () => {
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard'
    },
    {
      text: 'Manage Users',
      icon: <PeopleIcon />,
      path: '/admin/users'
    },
    {
      text: 'Generate Reports',
      icon: <DescriptionIcon />,
      path: '/admin/reports'
    },
    // ... other menu items
  ];

  return (
    // ... existing layout code ...
    <List>
      {menuItems.map((item) => (
        <ListItem
          button
          component={Link}
          to={item.path}
          key={item.text}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
    // ... rest of the layout
  );
};

export default AdminLayout; 