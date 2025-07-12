import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-400",
    Processing: "bg-blue-100 text-blue-800 border-blue-400",
    Completed: "bg-green-100 text-green-800 border-green-400",
    Cancelled: "bg-red-100 text-red-800 border-red-400"
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOrderId, setEditOrderId] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [search, setSearch] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('pos-token');
            const [orderRes, prodRes] = await Promise.all([
                axios.get('http://localhost:3000/api/order', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:3000/api/product', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setOrders(orderRes.data.orders || []);
            setProducts(prodRes.data.products || []);
        } catch (error) {
            console.error('Error fetching orders/products:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const getProductStock = (productId) => {
        const prod = products.find(p => p._id === (productId._id || productId));
        return prod ? prod.quantity : '-';
    };

    const handleStatusEdit = (order) => {
        setEditOrderId(order._id);
        setEditStatus(order.status);
    };

    const handleStatusSave = async (orderId) => {
        try {
            const response = await axios.put(
                `http://localhost:3000/api/order/${orderId}/status`,
                { status: editStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` } }
            );
            if (response.data.success) {
                setEditOrderId(null);
                setEditStatus('');
                fetchAll();
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/order/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` }
                });
                if (response.data.success) {
                    fetchAll();
                }
            } catch (error) {
                alert('Error deleting order');
            }
        }
    };

    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (order.product?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-8">Orders</h1>
            <input
                type="text"
                placeholder="Search by Customer or Product"
                className="border p-2 rounded w-64 mb-6"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="overflow-x-auto rounded shadow">
                    <table className="min-w-full border-separate border-spacing-y-2">
                        <thead className="sticky top-0 bg-gray-100 z-10">
                            <tr>
                                <th className="p-3 text-left font-semibold">#</th>
                                <th className="p-3 text-left font-semibold">Product</th>
                                <th className="p-3 text-left font-semibold">Stock</th>
                                <th className="p-3 text-left font-semibold">Quantity</th>
                                <th className="p-3 text-left font-semibold">Customer</th>
                                <th className="p-3 text-left font-semibold">Date</th>
                                <th className="p-3 text-left font-semibold">Status</th>
                                <th className="p-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, idx) => (
                                <tr
                                    key={order._id}
                                    className="bg-white hover:bg-blue-50 transition-colors duration-150 rounded"
                                >
                                    <td className="p-3">{idx + 1}</td>
                                    <td className="p-3">{order.product?.name || ''}</td>
                                    <td className="p-3">{getProductStock(order.product)}</td>
                                    <td className="p-3">{order.quantity}</td>
                                    <td className="p-3">{order.customerName}</td>
                                    <td className="p-3">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</td>
                                    <td className="p-3">
                                        {editOrderId === order._id ? (
                                            <div className="flex items-center">
                                                <select
                                                    className="border rounded p-1"
                                                    value={editStatus}
                                                    onChange={e => setEditStatus(e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                                                    onClick={() => handleStatusSave(order._id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="ml-2 px-2 py-1 bg-gray-400 text-white rounded"
                                                    onClick={() => setEditOrderId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <span
                                                className={`inline-block px-3 py-1 border rounded-full text-xs font-semibold cursor-pointer ${statusColors[order.status] || 'bg-gray-200 text-gray-800 border-gray-400'}`}
                                                onClick={() => handleStatusEdit(order)}
                                                title="Click to edit"
                                            >
                                                {order.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <button
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                onClick={() => handleDelete(order._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center text-gray-500 p-4">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;