import React from 'react';
import { Outlet } from 'react-router';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import EmployeeHome from './EmployeeHome';
import EmployeeProducts from './EmployeeProducts';
import PlaceOrder from './PlaceOrder';
import MyOrders from './MyOrders';
import OrderHistory from './OrderHistory';
import EmployeeNotifications from './EmployeeNotifications';
import EmployeeProfile from './EmployeeProfile';

const EmployeeDashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <EmployeeSidebar />
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
};

export default EmployeeDashboard;