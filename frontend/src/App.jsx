import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContext } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student
import StudentDashboard from './pages/student/Dashboard';
import NewRequest from './pages/student/NewRequest';
import MyRequests from './pages/student/MyRequests';

// Staff
import StaffDashboard from './pages/staff/Dashboard';

// Admin
import AdminDashboard from './pages/admin/Dashboard';

// Shared
import RequestDetail from './pages/shared/RequestDetail';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><Layout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="new" element={<NewRequest />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="requests/:id" element={<RequestDetail />} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF']}><Layout /></ProtectedRoute>}>
        <Route index element={<StaffDashboard />} />
        <Route path="requests/:id" element={<RequestDetail />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="requests/:id" element={<RequestDetail />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
