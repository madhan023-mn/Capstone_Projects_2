import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Customer Pages
import Home from './pages/customer/Home';
import Catalog from './pages/customer/Catalog';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Wishlist from './pages/customer/Wishlist';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';

// Vendor Pages
import VendorApply from './pages/vendor/VendorApply';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorEarnings from './pages/vendor/VendorEarnings';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorProductForm from './pages/vendor/VendorProductForm';
import VendorOrders from './pages/vendor/VendorOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendors from './pages/admin/AdminVendors';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminOrders from './pages/admin/AdminOrders';

// Route Guards
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public & Customer Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/search" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Customer Routes */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Vendor Onboarding & Portal Routes */}
          <Route
            path="/vendor/apply"
            element={
              <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                <VendorApply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/earnings"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products/new"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorOrders />
              </ProtectedRoute>
            }
          />

          {/* Admin Governance Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminVendors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCoupons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
