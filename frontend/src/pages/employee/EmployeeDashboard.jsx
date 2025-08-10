import React from 'react';
import { Routes, Route } from 'react-router';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import EmployeeHome from './EmployeeHome';
import EmployeeProducts from './EmployeeProducts';
import PlaceOrder from './PlaceOrder';
import MyOrders from './MyOrders';
import OrderHistory from './OrderHistory';
import EmployeeProfile from './EmployeeProfile';

const EmployeeDashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <EmployeeSidebar />
            <div className="flex-1 overflow-hidden">
                <Routes>
                    <Route index element={<EmployeeHome />} />
                    <Route path="products" element={<EmployeeProducts />} />
                    <Route path="place-order" element={<PlaceOrder />} />
                    <Route path="my-orders" element={<MyOrders />} />
                    <Route path="order-history" element={<OrderHistory />} />
                    <Route path="profile" element={<EmployeeProfile />} />
                </Routes>
            </div>
        </div>
    );
};

export default EmployeeDashboard;