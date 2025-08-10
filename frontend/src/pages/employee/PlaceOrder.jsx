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
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Place New Order</h1>
                    <p className="text-gray-600 mt-2">Add products to your cart and place orders</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products Section */}
                    <div className="lg:col-span-2">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                        <span className="text-lg font-bold text-green-600">${product.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{product.category?.categoryName}</p>
                                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{product.quantity} available</span>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                        >
                                            <FaPlus className="inline mr-1" />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
                                <p className="text-gray-600">No products found</p>
                            </div>
                        )}
                    </div>

                    {/* Cart Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 sticky top-6">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <FaShoppingCart className="mr-2" />
                                        Cart ({cart.length})
                                    </h2>
                                    {cart.length > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="text-sm text-red-500 hover:text-red-700"
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
                                                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                        <p className="text-sm text-gray-600">${item.price} each</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                                                            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                        >
                                                            <FaMinus className="text-xs" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                                            className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                                                        >
                                                            <FaPlus className="text-xs" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 mb-6">
                                            <div className="flex justify-between items-center text-lg font-semibold">
                                                <span>Total:</span>
                                                <span className="text-green-600">${getTotalAmount().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Order Options */}
                                        <div className="space-y-4 mb-6">
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
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                                <textarea
                                                    value={orderForm.notes}
                                                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    rows="3"
                                                    placeholder="Any special instructions..."
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePlaceOrder}
                                            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                                        >
                                            Place Order
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <FaShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
                                        <p className="text-gray-600">Your cart is empty</p>
                                        <p className="text-sm text-gray-500">Add products to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;