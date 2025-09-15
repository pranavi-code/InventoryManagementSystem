import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import { FaSearch, FaShoppingCart, FaEye, FaFilter, FaSpinner, FaBox, FaTags, FaDollarSign } from 'react-icons/fa';
import { io } from 'socket.io-client';

const EmployeeProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderForm, setOrderForm] = useState({
        quantity: 1,
        priority: 'Medium',
        notes: ''
    });
    const socketRef = useRef(null);

    useEffect(() => {
        fetchData();

        // Real-time stock update via Socket.IO
        socketRef.current = io('http://localhost:3000');

        socketRef.current.on('stockUpdate', ({ productId, newQuantity }) => {
            setProducts((prevProducts) =>
                prevProducts.map((prod) =>
                    prod._id === productId ? { ...prod, quantity: newQuantity } : prod
                )
            );
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                API.get('/product'),
                API.get('/category')
            ]);

            setProducts(productsRes.data.products || []);
            setCategories(categoriesRes.data.categories || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('pos-token');
            const user = JSON.parse(localStorage.getItem('pos-user'));

            const response = await API.post(
                '/order/add',
                {
                    product: selectedProduct._id,
                    quantity: orderForm.quantity,
                    customerName: user.name,
                    priority: orderForm.priority,
                    notes: orderForm.notes
                }
            );

            if (response.data.success) {
                alert('Order placed successfully!');
                setShowOrderModal(false);
                setOrderForm({ quantity: 1, priority: 'Medium', notes: '' });
                setSelectedProduct(null);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Error placing order');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                            product.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (quantity <= 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="backdrop-blur-xl bg-white/30 p-8 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex flex-col items-center space-y-4">
                        <FaSpinner className="text-4xl text-indigo-600 animate-spin" />
                        <div className="text-xl font-semibold text-gray-700">Loading products...</div>
                        <div className="text-sm text-gray-500">Fetching latest inventory data</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="mb-8 animate-slide-down">
                    <div className="backdrop-blur-xl bg-white/30 p-8 rounded-3xl border border-white/20 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Products Catalog ✨
                                </h1>
                                <p className="text-gray-600 mt-3 text-lg">Browse and order from our available inventory</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <FaBox className="text-2xl text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="backdrop-blur-xl bg-white/30 rounded-3xl border border-white/20 shadow-2xl p-6 mb-8 animate-slide-up">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 text-lg z-10" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-12 pr-4 py-3 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400 shadow-lg"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:w-64">
                            <div className="relative">
                                <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 text-lg z-10" />
                                <select
                                    className="w-full pl-12 pr-4 py-3 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg shadow-lg appearance-none"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
                    {filteredProducts.map((product, index) => {
                        const stockStatus = getStockStatus(product.quantity);
                        return (
                            <div 
                                key={product._id} 
                                className="group backdrop-blur-xl bg-white/30 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                                        <FaBox className="text-white text-lg" />
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stockStatus.color} shadow-md`}>
                                        {stockStatus.text}
                                    </span>
                                </div>
                                
                                <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-2">
                                    {product.name}
                                </h3>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <FaTags className="text-indigo-400 text-sm" />
                                    <p className="text-sm text-gray-600 font-medium">{product.category?.categoryName}</p>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                    {product.description}
                                </p>
                                
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <FaDollarSign className="text-green-500 text-sm" />
                                        <span className="text-2xl font-bold text-green-600">{product.price}</span>
                                    </div>
                                    <span className="text-sm text-gray-500 bg-gray-100/50 px-2 py-1 rounded-lg">
                                        {product.quantity} available
                                    </span>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setSelectedProduct(product)}
                                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center"
                                    >
                                        <FaEye className="mr-1" />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setShowOrderModal(true);
                                        }}
                                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 px-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                                        disabled={product.quantity === 0}
                                    >
                                        <FaEye className="text-sm" />
                                        View
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setShowOrderModal(true);
                                        }}
                                        disabled={product.quantity === 0}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                                    >
                                        <FaShoppingCart className="text-sm" />
                                        Order
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-16 animate-fade-in">
                        <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <FaSearch className="text-4xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No products found</h3>
                            <p className="text-gray-600 leading-relaxed">
                                No products match your current search criteria. Try adjusting your filters or search terms.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        
        {/* Product Detail Modal */}
        {selectedProduct && !showOrderModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                            {selectedProduct.name}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaTags className="text-indigo-500" />
                                <span className="font-medium text-gray-700">Category:</span>
                                <span className="text-gray-600">{selectedProduct.category?.categoryName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaBox className="text-purple-500" />
                                <span className="font-medium text-gray-700">Supplier:</span>
                                <span className="text-gray-600">{selectedProduct.supplier?.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaDollarSign className="text-green-500" />
                                <span className="font-medium text-gray-700">Price:</span>
                                <span className="text-green-600 font-bold text-lg">${selectedProduct.price}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaShoppingCart className="text-blue-500" />
                                <span className="font-medium text-gray-700">Available Stock:</span>
                                <span className="text-gray-600 font-semibold">{selectedProduct.quantity}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                    <FaEye className="text-indigo-500" />
                                    Description:
                                </span>
                                <p className="text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl">
                                    {selectedProduct.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-8">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setShowOrderModal(true)}
                                disabled={selectedProduct.quantity === 0}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                            >
                                Order Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Order Modal */}
        {showOrderModal && selectedProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                            Place Order
                        </h3>
                        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                            <h4 className="font-bold text-lg text-gray-800">{selectedProduct.name}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Price: <span className="font-semibold text-green-600">${selectedProduct.price}</span></span>
                                <span className="text-sm text-gray-600">Available: <span className="font-semibold">{selectedProduct.quantity}</span></span>
                            </div>
                        </div>
                            
                            <form onSubmit={handleOrderSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProduct.quantity}
                                        value={orderForm.quantity}
                                        onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value)})}
                                        className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg shadow-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Priority</label>
                                    <select
                                        value={orderForm.priority}
                                        onChange={(e) => setOrderForm({...orderForm, priority: e.target.value})}
                                        className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg shadow-lg appearance-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Notes (Optional)</label>
                                    <textarea
                                        value={orderForm.notes}
                                        onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                                        className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg shadow-lg resize-none"
                                        rows="3"
                                        placeholder="Any special instructions..."
                                    />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                                    <p className="text-lg text-green-800">
                                        <span className="font-semibold">Total Amount: </span>
                                        <span className="font-bold">${(selectedProduct.price * orderForm.quantity).toFixed(2)}</span>
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOrderModal(false);
                                            setSelectedProduct(null);
                                            setOrderForm({ quantity: 1, priority: 'Medium', notes: '' });
                                        }}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeProducts;