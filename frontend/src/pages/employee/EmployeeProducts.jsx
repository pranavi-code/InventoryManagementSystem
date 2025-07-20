import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import { FaSearch, FaShoppingCart, FaEye, FaFilter } from 'react-icons/fa';
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
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Products Catalog</h1>
                <p className="text-gray-600 mt-2">Browse and order from available inventory</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="md:w-64">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.quantity);
                    return (
                        <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{product.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                        {stockStatus.text}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">{product.category?.categoryName}</p>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-2xl font-bold text-green-600">${product.price}</span>
                                    <span className="text-sm text-gray-600">{product.quantity} available</span>
                                </div>

                                <div className="flex space-x-2">
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
                                        disabled={product.quantity === 0}
                                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <FaShoppingCart className="mr-1" />
                                        Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">No products found matching your criteria</p>
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && !showOrderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4">{selectedProduct.name}</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-medium">Category:</span>
                                    <span className="ml-2">{selectedProduct.category?.categoryName}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Supplier:</span>
                                    <span className="ml-2">{selectedProduct.supplier?.name}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Price:</span>
                                    <span className="ml-2 text-green-600 font-semibold">${selectedProduct.price}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Available Stock:</span>
                                    <span className="ml-2">{selectedProduct.quantity}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Description:</span>
                                    <p className="mt-1 text-gray-600">{selectedProduct.description}</p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => setShowOrderModal(true)}
                                    disabled={selectedProduct.quantity === 0}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Place Order</h3>
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium">{selectedProduct.name}</h4>
                                <p className="text-sm text-gray-600">Price: ${selectedProduct.price}</p>
                                <p className="text-sm text-gray-600">Available: {selectedProduct.quantity}</p>
                            </div>
                            
                            <form onSubmit={handleOrderSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedProduct.quantity}
                                            value={orderForm.quantity}
                                            onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                        <select
                                            value={orderForm.priority}
                                            onChange={(e) => setOrderForm({...orderForm, priority: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                                        <textarea
                                            value={orderForm.notes}
                                            onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Any special instructions..."
                                        />
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-medium">Total Amount: </span>
                                            ${(selectedProduct.price * orderForm.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOrderModal(false);
                                            setSelectedProduct(null);
                                            setOrderForm({ quantity: 1, priority: 'Medium', notes: '' });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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