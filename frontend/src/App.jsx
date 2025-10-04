import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Auth/Login';
import RegisterSuperAdmin from './pages/Auth/RegisterSuperAdmin';

// SuperAdmin Pages
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import Companies from './pages/SuperAdmin/Companies';
import Statistics from './pages/SuperAdmin/Statistics';
import CreateCompany from './pages/SuperAdmin/CreateCompany';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import Employees from './pages/Admin/Employees';
import Attendance from './pages/Admin/Attendance';
import Timesheets from './pages/Admin/Timesheets';
import Departments from './pages/Admin/Departments';
import Contracts from './pages/Admin/Contracts';
import Leaves from './pages/Admin/Leaves';

// Caissier Pages
import CaissierDashboard from './pages/Caissier/Dashboard';
import Payments from './pages/Caissier/Payments';

// Employee Pages
import EmployeeDashboard from './pages/Employee/Dashboard';
import Profile from './pages/Employee/Profile';
import Payslips from './pages/Employee/Payslips';
import MyTimesheets from './pages/Employee/MyTimesheets';
import MyLeaves from './pages/Employee/MyLeaves';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'SUPERADMIN':
        return <Navigate to="/superadmin/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'CAISSIER':
        return <Navigate to="/caissier/dashboard" replace />;
      case 'EMPLOYEE':
        return <Navigate to="/employee/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-superadmin" element={<RegisterSuperAdmin />} />

          {/* SuperAdmin Routes */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/companies"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <Layout>
                  <Companies />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/statistics"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <Layout>
                  <Statistics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/companies/create"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <CreateCompany />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/companies/:id"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <CreateCompany />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <Employees />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <Attendance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timesheets"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <Timesheets />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <Departments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contracts"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <Contracts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leaves"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <Leaves />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Caissier Routes */}
          <Route
            path="/caissier/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CAISSIER']}>
                <Layout>
                  <CaissierDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/caissier/payments"
            element={
              <ProtectedRoute allowedRoles={['CAISSIER']}>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/payslips"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <Layout>
                  <Payslips />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/timesheets"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <Layout>
                  <MyTimesheets />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leaves"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <Layout>
                  <MyLeaves />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
