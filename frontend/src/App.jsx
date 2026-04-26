import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login    from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CustomerLayout    from './components/common/CustomerLayout';
import CustomerDashboard from './pages/Customer/Dashboard';
import BrowsePlans       from './pages/Customer/BrowsePlans';
import PlanDetail        from './pages/Customer/PlanDetail';
import MySubscriptions   from './pages/Customer/MySubscriptions';
import SkipCalendar      from './pages/Customer/SkipCalendar';
import TrackOrder        from './pages/Customer/TrackOrder';
import Wallet            from './pages/Customer/Wallet';
import Profile           from './pages/Customer/Profile';
import VendorLayout    from './components/common/VendorLayout';
import VendorDashboard from './pages/Vendor/Dashboard';
import VendorOrders    from './pages/Vendor/Orders';
import VendorPlans     from './pages/Vendor/MealPlans';
import VendorSubs      from './pages/Vendor/Subscriptions';
import VendorAnalytics from './pages/Vendor/Analytics';
import AdminDashboard  from './pages/Admin/Dashboard';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)                  return <Navigate to="/login" replace />;
  if (user.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
  if (user.role === 'admin')  return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '12px' } }} />
          <Routes>
            <Route path="/"         element={<RoleRedirect />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/customer" element={<PrivateRoute roles={['customer']}><CustomerLayout /></PrivateRoute>}>
              <Route path="dashboard"     element={<CustomerDashboard />} />
              <Route path="browse"        element={<BrowsePlans />} />
              <Route path="browse/:id"    element={<PlanDetail />} />
              <Route path="subscriptions" element={<MySubscriptions />} />
              <Route path="skip/:id"      element={<SkipCalendar />} />
              <Route path="track/:id"     element={<TrackOrder />} />
              <Route path="wallet"        element={<Wallet />} />
              <Route path="profile"       element={<Profile />} />
            </Route>

            <Route path="/vendor" element={<PrivateRoute roles={['vendor']}><VendorLayout /></PrivateRoute>}>
              <Route path="dashboard"   element={<VendorDashboard />} />
              <Route path="orders"      element={<VendorOrders />} />
              <Route path="plans"       element={<VendorPlans />} />
              <Route path="subscribers" element={<VendorSubs />} />
              <Route path="analytics"   element={<VendorAnalytics />} />
            </Route>

            <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}