import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import { FaShoppingCart, FaSearch, FaPlus, FaMinus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const PlaceOrder = ({ onOrderPlaced }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [orderForm, setOrderForm] = useState({
        priority: 'Medium',
        notes: ''
    });
    const socketRef = useRef(null);

    useEffect(() => {
        fetchData();
        
        // Setup Socket.IO for real-time stock updates
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

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

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

    const addToCart = (product) => {
        const existingItem = cart.find(item => item._id === product._id);
        if (existingItem) {
            if (existingItem.quantity < product.quantity) {
                setCart(cart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                alert('Cannot add more items than available in stock');
            }
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p._id === productId);
        if (newQuantity > product.quantity) {
            alert('Cannot add more items than available in stock');
            return;
        }

        setCart(cart.map(item =>
            item._id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item._id !== productId));
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            setCart([]);
            localStorage.removeItem('cart');
        }
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            alert('Please add items to cart before placing order');
            return;
        }

        try {
            // Place individual orders for each cart item
            const orderPromises = cart.map(item =>
                API.post('/order/add', {
                    product: item._id,
                    quantity: item.quantity,
                    customerName: user.name,
                    priority: orderForm.priority,
                    notes: orderForm.notes
                })
            );

            await Promise.all(orderPromises);
            
            alert('Orders placed successfully!');
            setCart([]);
            setOrderForm({ priority: 'Medium', notes: '' });
            if (onOrderPlaced) {
                onOrderPlaced();
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Error placing orders');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
        const inStock = product.quantity > 0;
        return matchesSearch && matchesCategory && inStock;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
                    <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Loading products...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Place New Order
                            </h1>
                            <p className="text-gray-600 text-lg">Add products to your cart and place orders with ease</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Products Section */}
                        <div className="lg:col-span-2">
                            {/* Filters */}
                            <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                className="w-full pl-12 pr-4 py-3 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:w-64">
                                        <select
                                            className="w-full px-4 py-3 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg appearance-none"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                                            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${product.price}</span>
                                        </div>
                                        <div className="mb-3">
                                            <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                {product.category?.categoryName}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 font-medium">
                                                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                                {product.quantity} available
                                            </span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                                            >
                                                <FaPlus />
                                                <span>Add to Cart</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-16 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/20">
                                    <FaSearch className="mx-auto text-5xl text-gray-400 mb-6" />
                                    <p className="text-gray-600 text-lg font-semibold">No products found</p>
                                    <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>

                        {/* Cart Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 sticky top-6">
                                <div className="p-6 border-b border-white/20">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <FaShoppingCart className="mr-3 text-blue-600" />
                                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                Cart ({cart.length})
                                            </span>
                                        </h2>
                                        {cart.length > 0 && (
                                            <button
                                                onClick={clearCart}
                                                className="text-sm text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-300"
                                            >
                                                Clear Cart
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {cart.length > 0 ? (
                                        <>
                                            <div className="space-y-4 mb-6">
                                                {cart.map((item) => (
                                                    <div key={item._id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                                <p className="text-sm text-gray-600">${item.price} each</p>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <button
                                                                    onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                                                                    className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                                                                >
                                                                    <FaMinus className="text-xs" />
                                                                </button>
                                                                <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                                                    className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg"
                                                                >
                                                                    <FaPlus className="text-xs" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-white/20 pt-6 mb-6">
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                                                    <div className="flex justify-between items-center text-lg font-bold">
                                                        <span className="text-gray-700">Total:</span>
                                                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-xl">
                                                            ${getTotalAmount().toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Options */}
                                            <div className="space-y-6 mb-8">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Priority</label>
                                                    <select
                                                        value={orderForm.priority}
                                                        onChange={(e) => setOrderForm({...orderForm, priority: e.target.value})}
                                                        className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg appearance-none"
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Urgent">Urgent</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Notes</label>
                                                    <textarea
                                                        value={orderForm.notes}
                                                        onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                                                        className="w-full border-2 border-white/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg resize-none"
                                                        rows="3"
                                                        placeholder="Any special instructions..."
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handlePlaceOrder}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
                                            >
                                                Place Order
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center py-12">
                                            <FaShoppingCart className="mx-auto text-5xl text-gray-400 mb-6" />
                                            <p className="text-gray-600 text-lg font-semibold">Your cart is empty</p>
                                            <p className="text-sm text-gray-500 mt-2">Add products to get started</p>
                                        </div>
                                    )}
                                </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;