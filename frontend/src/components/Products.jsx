import React, { useEffect, useState, useRef } from 'react';
import API from '../utils/api';
import { io } from 'socket.io-client';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBox, FaTimes, FaFilter, FaSort } from 'react-icons/fa';

const Products = () => {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        supplier: "",
        price: "",
        quantity: "",
        description: ""
    });
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editProductId, setEditProductId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const socketRef = useRef(null);

    // Fetch products, categories, suppliers
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, supRes] = await Promise.all([
                API.get('/product'),
                API.get('/category'),
                API.get('/supplier'),
            ]);
            setProducts(prodRes.data.products || []);
            setCategories(catRes.data.categories || []);
            setSuppliers(supRes.data.suppliers || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();

        // Real-time stock update via Socket.IO
        socketRef.current = io('http://localhost:3000', {
            transports: ['polling', 'websocket'],
            reconnection: true,
        });

        socketRef.current.on('stock_update', ({ productId, quantity }) => {
            setProducts((prevProducts) =>
                prevProducts.map((prod) =>
                    prod._id === productId ? { ...prod, quantity } : prod
                )
            );
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate required fields
        if (
            !formData.name.trim() ||
            !formData.category ||
            !formData.supplier ||
            !formData.price ||
            !formData.quantity
        ) {
            alert('Please fill all required fields (Name, Category, Supplier, Price, Quantity)');
            return;
        }
        try {
            if (editProductId) {
                const response = await API.put(
                    `/product/${editProductId}`,
                    {
                        ...formData,
                        price: Number(formData.price),
                        quantity: Number(formData.quantity)
                    }
                );
                if (response.data.success) {
                    alert('Product updated successfully');
                    setEditProductId(null);
                    setModalOpen(false);
                    setFormData({ name: "", category: "", supplier: "", price: "", quantity: "", description: "" });
                    fetchAll();
                } else {
                    alert(response.data.error || 'Failed to update product');
                }
            } else {
                const response = await API.post('/product/add', {
                    ...formData,
                    price: Number(formData.price),
                    quantity: Number(formData.quantity)
                });
                if (response.data.success) {
                    alert('Product added successfully');
                    setModalOpen(false);
                    setFormData({ name: "", category: "", supplier: "", price: "", quantity: "", description: "" });
                    fetchAll();
                } else {
                    alert(response.data.error || 'Failed to add product');
                }
            }
        } catch (error) {
            alert('Error saving product');
            console.error(error);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            category: product.category,
            supplier: product.supplier,
            price: product.price.toString(),
            quantity: product.quantity.toString(),
            description: product.description || ""
        });
        setEditProductId(product._id);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await API.delete(`/product/${id}`);
                if (response.data.success) {
                    alert('Product deleted successfully');
                    fetchAll();
                } else {
                    alert(response.data.error || 'Failed to delete product');
                }
            } catch (error) {
                alert('Error deleting product');
                console.error(error);
            }
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditProductId(null);
        setFormData({ name: "", category: "", supplier: "", price: "", quantity: "", description: "" });
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.categoryName : 'Unknown';
    };

    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(sup => sup._id === supplierId);
        return supplier ? supplier.name : 'Unknown';
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (quantity < 10) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
        return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const filteredAndSortedProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                                product.description?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                case 'quantity':
                    return a.quantity - b.quantity;
                case 'category':
                    return getCategoryName(a.category).localeCompare(getCategoryName(b.category));
                default:
                    return 0;
            }
        });

    const getRandomColor = (index) => {
        const colors = [
            'bg-gradient-to-r from-blue-500 to-blue-600',
            'bg-gradient-to-r from-green-500 to-green-600',
            'bg-gradient-to-r from-purple-500 to-purple-600',
            'bg-gradient-to-r from-pink-500 to-pink-600',
            'bg-gradient-to-r from-yellow-500 to-yellow-600',
            'bg-gradient-to-r from-red-500 to-red-600',
            'bg-gradient-to-r from-indigo-500 to-indigo-600',
            'bg-gradient-to-r from-emerald-500 to-emerald-600'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
                <p className="text-gray-600">Manage your product inventory and track stock levels</p>
            </div>

            {/* Search, Filter, and Add Button */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                        <option value="quantity">Sort by Quantity</option>
                        <option value="category">Sort by Category</option>
                    </select>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
                    >
                        <FaPlus />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">Loading products...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map((product, index) => {
                        const stockStatus = getStockStatus(product.quantity);
                        return (
                            <div key={product._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${getRandomColor(index)}`}>
                                        <FaBox className="text-white text-xl" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {product.description || 'No description available'}
                                </p>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Category:</span>
                                        <span className="font-medium">{getCategoryName(product.category)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Supplier:</span>
                                        <span className="font-medium">{getSupplierName(product.supplier)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Price:</span>
                                        <span className="font-bold text-green-600">${product.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Quantity:</span>
                                        <span className="font-medium">{product.quantity}</span>
                                    </div>
                                </div>
                                
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                    {stockStatus.status}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-12">
                    <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">
                        {search || categoryFilter ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first product'}
                    </p>
                    {!search && !categoryFilter && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors duration-200"
                        >
                            <FaPlus />
                            Add Product
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editProductId ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier *
                                </label>
                                <select
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(sup => (
                                        <option key={sup._id} value={sup._id}>{sup.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter product description"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                                >
                                    {editProductId ? 'Update Product' : 'Add Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;