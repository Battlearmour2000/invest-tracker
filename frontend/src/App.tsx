import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/adminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterStaff from './pages/Register';
import UserDashboard from './pages/Dashboard';
import { usePriceWebSocket } from './hooks/usePriceWebSocket';

// Helper to get is_data_admin from localStorage (or use context/auth hook)
function isAdmin() {
  return localStorage.getItem('is_data_admin') === 'true';
}

export const queryClient = new QueryClient();

function App() {
  usePriceWebSocket();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-staff" element={<RegisterStaff />} />
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={isAdmin() ? <Navigate to="/admin-dashboard" /> : <UserDashboard />}
            />
            <Route
              path="/admin-dashboard"
              element={isAdmin() ? <AdminDashboard /> : <Navigate to="/dashboard" />}
            />
            <Route index element={<Dashboard />} />
          </Route>
          {/* Add other routes as needed */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;