import React, { useEffect, useState, useRef } from 'react';
import API from '../utils/api';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock, in-stock
    const socketRef = useRef(null);

    // Fetch products for inventory management
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await API.get('/product');
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
        
        // Setup Socket.IO for real-time updates
        socketRef.current = io('http://localhost:3000');
        
        socketRef.current.on('stock_update', (data) => {
            setProducts(prevProducts => 
                prevProducts.map(product => 
                    product._id === data.productId 
                        ? { ...product, quantity: data.quantity }
                        : product
                )
            );
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Update stock quantity
    const updateStock = async (productId, newQuantity) => {
        try {
            const product = products.find(p => p._id === productId);
            const response = await API.put(
                `/product/${productId}`,
                {
                    ...product,
                    quantity: newQuantity,
                    category: product.category._id,
                    supplier: product.supplier._id
                }
            );
            if (response.data.success) {
                alert('Stock updated successfully');
                fetchProducts();
            } else {
                alert(response.data.error || 'Failed to update stock');
            }
        } catch (error) {
            alert('Error updating stock');
            console.error(error);
        }
    };

    // Get stock status
    const getStockStatus = (quantity) => {
        if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100', icon: <FaTimesCircle /> };
        if (quantity < 10) return { status: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: <FaExclamationTriangle /> };
        return { status: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100', icon: <FaCheckCircle /> };
    };

    // Filter products based on selected filter
    const getFilteredProducts = () => {
        let filtered = products;

        // Apply search filter
        if (search) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.category?.categoryName.toLowerCase().includes(search.toLowerCase()) ||
                product.supplier?.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply stock filter
        switch (filter) {
            case 'low-stock':
                filtered = filtered.filter(product => product.quantity > 0 && product.quantity < 10);
                break;
            case 'out-of-stock':
                filtered = filtered.filter(product => product.quantity === 0);
                break;
            case 'in-stock':
                filtered = filtered.filter(product => product.quantity >= 10);
                break;
            default:
                break;
        }

        return filtered;
    };

    const filteredProducts = getFilteredProducts();

    // Calculate inventory statistics
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;
    const inStockCount = products.filter(p => p.quantity >= 10).length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Inventory Management</h1>

            {/* Inventory Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-blue-800">Total Products</h3>
                    <p className="text-2xl font-bold text-blue-900">{totalProducts}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-green-800">In Stock</h3>
                    <p className="text-2xl font-bold text-green-900">{inStockCount}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-yellow-800">Low Stock</h3>
                    <p className="text-2xl font-bold text-yellow-900">{lowStockCount}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-red-800">Out of Stock</h3>
                    <p className="text-2xl font-bold text-red-900">{outOfStockCount}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-purple-800">Total Value</h3>
                    <p className="text-2xl font-bold text-purple-900">${totalValue.toFixed(2)}</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                    >
                        <option value="all">All Products</option>
                        <option value="in-stock">In Stock</option>
                        <option value="low-stock">Low Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="text-center py-8">Loading inventory...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Current Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => {
                                    const stockInfo = getStockStatus(product.quantity);
                                    return (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.category?.categoryName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.supplier?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${product.price}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={product.quantity}
                                                    onChange={(e) => {
                                                        const newQuantity = parseInt(e.target.value) || 0;
                                                        if (newQuantity !== product.quantity) {
                                                            updateStock(product._id, newQuantity);
                                                        }
                                                    }}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockInfo.bgColor} ${stockInfo.color}`}>
                                                    <span className="mr-1">{stockInfo.icon}</span>
                                                    {stockInfo.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${(product.price * product.quantity).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        const newQuantity = prompt('Enter new stock quantity:', product.quantity);
                                                        if (newQuantity !== null && !isNaN(newQuantity)) {
                                                            updateStock(product._id, parseInt(newQuantity));
                                                        }
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Update Stock
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No products found matching your criteria
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Inventory;