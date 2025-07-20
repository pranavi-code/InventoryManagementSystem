import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SalesList = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await API.get('/sales');
                setSales(response.data.sales || []);
            } catch (error) {
                console.error('Error fetching sales:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    if (loading) return <div className="p-6">Loading sales...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Sales History</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Product</th>
                            <th className="p-2 border">Quantity Sold</th>
                            <th className="p-2 border">Total Amount</th>
                            <th className="p-2 border">Sold By</th>
                            <th className="p-2 border">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale._id} className="border-t">
                                <td className="p-2">{sale.product?.name || 'N/A'}</td>
                                <td className="p-2">{sale.quantitySold}</td>
                                <td className="p-2">${sale.totalAmount.toFixed(2)}</td>
                                <td className="p-2">{sale.createdBy?.name || 'N/A'}</td>
                                <td className="p-2">{new Date(sale.saleDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sales.length === 0 && <p className="p-4 text-center">No sales recorded.</p>}
            </div>
        </div>
    );
};

export default SalesList;