import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Customer from './pages/Customer';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';
import AdminBookings from './pages/AdminBookings';
import AdminCustomers from './pages/AdminCustomers';
import AdminPayments from './pages/AdminPayments';

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'admin' ? '/admin' : '/customer'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100 bg-cream">
          <Navbar />

          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Customer Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Customer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Menu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminMenu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCustomers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPayments />
                  </ProtectedRoute>
                }
              />

              {/* Default redirects */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>

          
          
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
