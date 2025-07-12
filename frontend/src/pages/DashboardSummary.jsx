import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardSummary = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        suppliers: 0,
        orders: 0,
        users: 0,
        lowStock: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('pos-token');
                const [prodRes, catRes, supRes, ordRes, userRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/product', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/category', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/supplier', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/order', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/api/user', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const products = prodRes.data.products || [];
                setStats({
                    products: products.length,
                    categories: catRes.data.categories.length,
                    suppliers: supRes.data.suppliers.length,
                    orders: ordRes.data.orders.length,
                    users: userRes.data.users.length,
                    lowStock: products.filter(p => p.quantity < 10).length,
                });
                setRecentOrders(ordRes.data.orders.slice(-5).reverse());
            } catch (error) {
                // handle error
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-100 p-4 rounded shadow text-center">
                            <div className="text-3xl font-bold">{stats.products}</div>
                            <div>Products</div>
                        </div>
                        <div className="bg-green-100 p-4 rounded shadow text-center">
                            <div className="text-3xl font-bold">{stats.categories}</div>
                            <div>Categories</div>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded shadow text-center">
                            <div className="text-3xl font-bold">{stats.suppliers}</div>
                            <div>Suppliers</div>
                        </div>
                        <div className="bg-purple-100 p-4 rounded shadow text-center">
                            <div className="text-3xl font-bold">{stats.orders}</div>
                            <div>Orders</div>
                        </div>
                        <div className="bg-pink-100 p-4 rounded shadow text-center">
                            <div className="text-3xl font-bold">{stats.users}</div>
                            <div>Users</div>
                        </div>
                        <div className="bg-red-100 p-4 rounded shadow text-center">
                            <div className="text-3xl font-bold">{stats.lowStock}</div>
                            <div>Low Stock (&lt;10)</div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">Product</th>
                                    <th className="border border-gray-300 p-2">Customer</th>
                                    <th className="border border-gray-300 p-2">Quantity</th>
                                    <th className="border border-gray-300 p-2">Status</th>
                                    <th className="border border-gray-300 p-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order._id}>
                                        <td className="border border-gray-300 p-2">{order.product?.name || ''}</td>
                                        <td className="border border-gray-300 p-2">{order.customerName}</td>
                                        <td className="border border-gray-300 p-2">{order.quantity}</td>
                                        <td className="border border-gray-300 p-2">{order.status}</td>
                                        <td className="border border-gray-300 p-2">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardSummary;