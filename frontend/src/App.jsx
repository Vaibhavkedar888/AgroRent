import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './layout/MainLayout';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetailsPage from './pages/EquipmentDetailsPage';
import SchemesPage from './pages/SchemesPage';
import ProfilePage from './pages/ProfilePage';
import AddEquipmentPage from './pages/owner/AddEquipmentPage';
import EditEquipmentPage from './pages/owner/EditEquipmentPage';
import ProtectedRoute from './components/ProtectedRoute';

import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<MainLayout />}>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={['OWNER']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/add-equipment"
              element={
                <ProtectedRoute allowedRoles={['OWNER']}>
                  <AddEquipmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/edit-equipment/:id"
              element={
                <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                  <EditEquipmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* General Dashboard Redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navigate to="/" replace />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
