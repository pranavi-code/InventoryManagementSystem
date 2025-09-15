import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoutes from './utils/ProtectedRoutes';
import Dashboard from './pages/Dashboard';
import Categories from './components/Categoties';
import Products from './components/Products';
import Suppliers from './components/Suppliers';
import Orders from './components/Orders';
import Employees from './components/Employees';
import Inventory from './components/Inventory';
import Profile from './components/Profile';
import SalesReport from './components/SalesReport';
import DashboardSummary from './pages/DashboardSummary';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AdminNotifications from './pages/AdminNotifications';
import EmployeeHome from './pages/employee/EmployeeHome';
import EmployeeProducts from './pages/employee/EmployeeProducts';
import PlaceOrder from './pages/employee/PlaceOrder';
import MyOrders from './pages/employee/MyOrders';
import OrderHistory from './pages/employee/OrderHistory';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
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
            <Route path="users" element={<Employees/>} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales-report" element={<SalesReport />} />
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
    </AuthProvider>
  );
}

export default App;