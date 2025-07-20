import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AnalyticsDashboard = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await API.get('/analytics');
                setAnalytics(response.data.analytics[0] || {});
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-6">Loading analytics...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold">Total Sales</h3>
                    <p className="text-2xl">${analytics.totalSales?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold">Total Orders</h3>
                    <p className="text-2xl">{analytics.totalOrders || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold">Top Products</h3>
                    <ul>
                        {analytics.productTrends?.map(trend => (
                            <li key={trend._id}>{trend.count} x {trend.product?.name || 'N/A'}</li>
                        )) || <li>No data</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;  