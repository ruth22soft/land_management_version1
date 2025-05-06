import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios for API calls
const API_BASE_URL = 'http://localhost:5000/api/users'; // Replace with your backend URL

import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    isActive: '',
    password: ''
  });

   // Fetch users from the backend
   const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (!token) {
        setError('You are not authorized. Please log in.');
        return;
      }
      const response = await axios.get(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the request headers
          }
        }
      );
      console.log('Fetched users:', response.data); // Log the fetched users
      // setUsers(response.data);
      //setUsers(Array.isArray(response.data) ? response.data : []); // Ensure users is always an array
      setUsers(Array.isArray(response.data.data) ? response.data.data : []); // Use response.data.data

    } catch (err) {
      console.error('Error fetching users:', err.response || err.message); // Log the error
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add this useEffect to monitor the `users` state
  useEffect(() => {
    console.log('Users state:', users); // Log the users array
  }, [users]);

  const handleOpenDialog = (type, user = null) => {
    setDialogType(type);
    setSelectedUser(user);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        password: user.password || '' // Ensure password is empty if not provided
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        isActive: '',
        password: ''
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      console.log('Form data being sent', formData); // Log the form data

      const updatedFormData = { 
        ...formData,
        isActive: formData.isActive === '' ? true : formData.isActive, // Ensure isActive is a boolean
      };
      if (dialogType === 'add') {
        await axios.post(API_BASE_URL, updatedFormData, {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the request headers
          }
        });
      } else if (dialogType === 'edit') {
        await axios.put(`${API_BASE_URL}/${selectedUser.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the request headers
          }
        });
      }
      fetchUsers(); // Refresh the user list
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving user:', err.response || err.message); // Log the error
      setError('Failed to save user. Please try again.');
    }
  };
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/${userId}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Include token in the request headers
        }
      });
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setError('Failed to delete user. Please try again.');
    }
  };


  const filteredUsers = users.filter(user => {
    return activeTab === 0 ? user.role === 'registration' : user.role === 'admin';
  });
  console.log('Filtered users:', filteredUsers); // Log the filtered users
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Registration Officers" />
        <Tab label="Administrators" />
      </Tabs>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add New User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role === 'admin' ? 'Administrator' : 'Registration Officer'}
                    color={user.role === 'admin' ? 'error' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                   label={user.isActive ? 'Active' : 'Inactive'} // Use isActive
                   color={user.isActive ? 'success' : 'warning'}
                   size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit User">
                    <IconButton onClick={() => handleOpenDialog('edit', user)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Password">
                    <IconButton onClick={() => handleOpenDialog('reset', user)}>
                      <LockIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Add New User' : 
           dialogType === 'edit' ? 'Edit User' : 
           'Reset Password'}
        </DialogTitle>

      <Button variant="contained" onClick={handleSubmit}>
        {dialogType === 'add' ? 'Add User' : 
        dialogType === 'edit' ? 'Save Changes' : 
        'Reset Password'}
      </Button>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dialogType !== 'reset' && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    label="Role"
                  >
                    <MenuItem value="registration">Registration Officer</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            {(dialogType === 'add' || dialogType === 'reset') && (
              <TextField
                fullWidth
                label={dialogType === 'reset' ? 'New Password' : 'Password'}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {dialogType === 'add' ? 'Add User' : 
             dialogType === 'edit' ? 'Save Changes' : 
             'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers; 