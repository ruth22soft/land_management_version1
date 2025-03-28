import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme/theme';

// Auth Provider
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// Lazy load components
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const ChangePassword = lazy(() => import('./components/auth/ChangePassword'));
const SecureAdminLogin = lazy(() => import('./components/auth/SecureAdminLogin'));
const OwnerRegistration = lazy(() => import('./components/OwnerRegistration'));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./components/admin/Dashboard'));
const GenerateReport = lazy(() => import('./components/admin/GenerateReport'));
const ManageUsers = lazy(() => import('./components/admin/ManageUsers'));

// Lazy load registration components
const RegistrationDashboard = lazy(() => import('./components/registration/RegistrationDashboard'));
const CertificationForm = lazy(() => import('./components/registration/CertificationForm'));
const ParcelManagement = lazy(() => import('./components/parcel/ParcelManagement'));
const LandOwnerManagement = lazy(() => import('./components/registration/LandOwnerManagement'));
const CertificateVerification = lazy(() => import('./components/registration/CertificateVerification'));
const CertificateHistory = lazy(() => import('./components/registration/CertificateHistory'));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login/registration" replace />} />
            <Route path="/register" element={<OwnerRegistration />} />
            <Route path="/login/registration" element={<LoginPage userType="registration" />} />
            <Route path="/login/admin" element={<LoginPage userType="admin" />} />
            <Route path="/secure-admin" element={<SecureAdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout userType="admin" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="reports" element={<GenerateReport />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            {/* Registration Office routes */}
            <Route
              path="/registration"
              element={
                <ProtectedRoute allowedRoles={['registration']}>
                  <MainLayout userType="registration" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RegistrationDashboard />} />
              <Route path="new-certification" element={<CertificationForm />} />
              <Route path="parcels" element={<ParcelManagement />} />
              <Route path="land-owners" element={<LandOwnerManagement />} />
              <Route path="verify-certificate" element={<CertificateVerification />} />
              <Route path="certificate-history" element={<CertificateHistory />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
