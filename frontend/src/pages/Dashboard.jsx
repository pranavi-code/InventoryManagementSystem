import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router';
const Dashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    )
}
export default Dashboard;