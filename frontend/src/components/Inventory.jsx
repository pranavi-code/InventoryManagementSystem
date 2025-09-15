import React, { useEffect, useState, useRef } from 'react';
import API from '../utils/api';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaSearch, FaBox, FaDollarSign, FaChartLine } from 'react-icons/fa';
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
                    category: typeof product.category === 'object' ? product.category._id : product.category,
                    supplier: typeof product.supplier === 'object' ? product.supplier._id : product.supplier
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
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="relative mb-8 animate-fadeInDown">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-relaxed pb-1">
                        Inventory Management
                    </h1>
                    <p className="text-gray-600 text-lg">Monitor and manage your product inventory in real-time</p>
                </div>
            </div>

            {/* Inventory Statistics */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fadeInUp">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Products</h3>
                            <p className="text-3xl font-bold text-gray-800">{totalProducts}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaBox className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">In Stock</h3>
                            <p className="text-3xl font-bold text-green-600">{inStockCount}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaCheckCircle className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">Low Stock</h3>
                            <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaExclamationTriangle className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">Out of Stock</h3>
                            <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaTimesCircle className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Value</h3>
                            <p className="text-3xl font-bold text-purple-600">${totalValue.toFixed(2)}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaDollarSign className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="relative flex flex-col md:flex-row justify-between items-center mb-8 gap-6 animate-fadeInUp">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl z-10" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-16 pr-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400 shadow-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg shadow-lg"
                >
                    <option value="all">All Products</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                </select>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="relative flex items-center justify-center h-64 animate-fadeInUp">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                        <div className="text-2xl text-gray-600 font-semibold">Loading inventory...</div>
                    </div>
                </div>
            ) : (
                <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-fadeInUp">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-gray-50/80 backdrop-blur-lg">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Current Stock
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 backdrop-blur-lg divide-y divide-gray-200/50">
                                {filteredProducts.map((product, index) => {
                                    const stockInfo = getStockStatus(product.quantity);
                                    return (
                                        <tr 
                                            key={product._id} 
                                            className="hover:bg-white/70 transition-all duration-300 hover:shadow-lg"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-600">{product.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {product.category?.categoryName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {product.supplier?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-green-600">
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
                                                    className="w-24 px-3 py-2 border-2 border-white/50 rounded-xl text-center font-bold text-gray-800 bg-white/80 backdrop-blur-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-lg ${stockInfo.bgColor} ${stockInfo.color}`}>
                                                    <span className="mr-2">{stockInfo.icon}</span>
                                                    {stockInfo.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-purple-600">
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
                                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <FaBox className="text-4xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No products found</h3>
                            <p className="text-gray-600">No products found matching your criteria</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Inventory;