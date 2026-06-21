import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Villages from './pages/Villages';
import VillageDetail from './pages/VillageDetail';
import Gallery from './pages/Gallery';
import Reports from './pages/Reports';
import Downloads from './pages/Downloads';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/admin/Dashboard';
import Applications from './pages/admin/Applications';
import ImageUpload from './pages/admin/ImageUpload';
import VillageManage from './pages/admin/VillageManage';
import UserManage from './pages/admin/UserManage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppLayout({ children, hideFooter }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 116px)', paddingTop: '116px' }}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/about" element={<AppLayout><About /></AppLayout>} />
      <Route path="/villages" element={<AppLayout><Villages /></AppLayout>} />
      <Route path="/villages/:id" element={<AppLayout><VillageDetail /></AppLayout>} />
      <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
      <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
      <Route path="/downloads" element={<AppLayout><Downloads /></AppLayout>} />
      <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
      <Route path="/login" element={<AppLayout hideFooter><Login /></AppLayout>} />
      <Route path="/partner" element={<AppLayout><Register /></AppLayout>} />

      {/* Admin & Authorized */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['super_admin', 'state_admin', 'district_admin', 'college']}>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/applications" element={
        <ProtectedRoute roles={['super_admin', 'state_admin']}>
          <AppLayout><Applications /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/upload" element={
        <ProtectedRoute roles={['super_admin', 'state_admin', 'district_admin', 'college']}>
          <AppLayout><ImageUpload /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/villages" element={
        <ProtectedRoute roles={['super_admin', 'state_admin']}>
          <AppLayout><VillageManage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['super_admin']}>
          <AppLayout><UserManage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
