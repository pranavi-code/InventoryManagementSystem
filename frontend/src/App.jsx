import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import Root from './utils/Root.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoutes from './utils/ProtectedRoutes.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Categories from './components/Categoties.jsx';
import Products from './components/Products.jsx';
import Suppliers from './components/Suppliers.jsx';
import Orders from './components/Orders.jsx';
import Users from './components/Users.jsx';
import Inventory from './components/Inventory.jsx';
import Profile from './components/Profile.jsx';
import DashboardSummary from './pages/DashboardSummary.jsx';
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';
import AdminNotifications from './pages/AdminNotifications.jsx';
import EmployeeHome from './pages/employee/EmployeeHome.jsx';
import EmployeeProducts from './pages/employee/EmployeeProducts.jsx';
import PlaceOrder from './pages/employee/PlaceOrder.jsx';
import MyOrders from './pages/employee/MyOrders.jsx';
import OrderHistory from './pages/employee/OrderHistory.jsx';
import EmployeeNotifications from './pages/employee/EmployeeNotifications.jsx';
import EmployeeProfile from './pages/employee/EmployeeProfile.jsx';
import Landing from './pages/Landing';

/**
 * Main App Component
 *
 * Handles routing for the entire inventory management system with role-based access:
 * - Admin Dashboard: Full access to all inventory management features
 * - Employee Dashboard: Order management and product browsing
 *
 * Features:
 * - Protected routes based on user roles
 * - Automatic redirection based on authentication status
 * - Comprehensive error handling for unauthorized access
 * - Responsive design across all routes
 */
import React, { useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import { io } from 'socket.io-client'

function App() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    // Global Socket.IO connection for all users (admin or employee)
    socketRef.current = io('http://localhost:3000', {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });
    socketRef.current.emit('register', user.id || user._id);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return (
    <Router>
     <Routes>
      <Route path="/" element={<Landing />} />
      
      {/* Admin Dashboard Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoutes requireRole={['admin']}>
            <Dashboard />
          </ProtectedRoutes>
        }
      >
        <Route index element={<DashboardSummary />} />
        <Route path="categories" element={<Categories/>} />
        <Route path="products" element={<Products/>} />
        <Route path="suppliers" element={<Suppliers/>} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users/>} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>
      
      {/* Employee Dashboard Routes */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoutes requireRole={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoutes>
        }
      >
        <Route index element={<EmployeeHome />} />
        <Route path="products" element={<EmployeeProducts />} />
        <Route path="place-order" element={<PlaceOrder />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="order-history" element={<OrderHistory />} />
        <Route path="notifications" element={<EmployeeNotifications />} />
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>
      
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Error Routes */}
      <Route
        path="/unauthorized"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
              <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
              <a href="/login" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Go to Login
              </a>
            </div>
          </div>
        }
      />
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
   </Router>
  )
}

export default App