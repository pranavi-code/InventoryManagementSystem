import React, { useEffect, useState, useRef } from 'react';
import API from '../utils/api';
import { io } from 'socket.io-client';

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
                const response = await API.post(
                    '/product/add',
                    {
                        ...formData,
                        price: Number(formData.price),
                        quantity: Number(formData.quantity)
                    }
                );
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
            alert(error.response?.data?.error || 'Error saving product');
            console.error(error);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            category: product.category?._id || product.category,
            supplier: product.supplier?._id || product.supplier,
            price: product.price,
            quantity: product.quantity,
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category?.categoryName.toLowerCase().includes(search.toLowerCase()) ||
        product.supplier?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-8'>Product Management</h1>
            <div className='flex justify-between items-center mb-4'>
                <input
                    type="text"
                    placeholder="Search Product"
                    className="border p-2 rounded w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className='px-4 py-2 bg-blue-500 text-white rounded cursor-pointer'
                    onClick={() => { setModalOpen(true); setEditProductId(null); setFormData({ name: "", category: "", supplier: "", price: "", quantity: "", description: "" }); }}
                >
                    Add Product
                </button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">S No</th>
                            <th className="border border-gray-300 p-2">Name</th>
                            <th className="border border-gray-300 p-2">Category</th>
                            <th className="border border-gray-300 p-2">Supplier</th>
                            <th className="border border-gray-300 p-2">Price</th>
                            <th className="border border-gray-300 p-2">Stock</th>
                            <th className="border border-gray-300 p-2">Description</th>
                            <th className="border border-gray-300 p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products
  .filter(prod => prod.name.toLowerCase().includes(search.toLowerCase()))
  .map((product, index) => (
                            <tr key={product._id}>
                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                <td className="border border-gray-300 p-2">{product.name}</td>
                                <td className="border border-gray-300 p-2">{product.category?.categoryName || ""}</td>
                                <td className="border border-gray-300 p-2">{product.supplier?.name || ""}</td>
                                <td className="border border-gray-300 p-2">{product.price}</td>
                                <td className="border border-gray-300 p-2">{product.quantity}</td>
                                <td className="border border-gray-300 p-2">{product.description}</td>
                                <td className="border border-gray-300 p-2">
                                    <button
                                        className='px-2 py-1 bg-yellow-500 text-white rounded mr-2'
                                        onClick={() => handleEdit(product)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className='px-2 py-1 bg-red-500 text-white rounded'
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {modalOpen && (
                <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50'>
                    <div className='bg-white p-6 rounded shadow-md w-full max-w-md relative'>
                        <h2 className='text-xl font-bold mb-4'>{editProductId ? "Edit Product" : "Add Product"}</h2>
                        <button
                            className='absolute top-4 right-4 font-bold text-lg cursor-pointer'
                            onClick={closeModal}
                        >
                            X
                        </button>
                        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                            <input
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                placeholder='Product Name'
                                className='border p-2 rounded'
                                required
                            />
                            <select
                                name='category'
                                value={formData.category}
                                onChange={handleChange}
                                className='border p-2 rounded'
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                ))}
                            </select>
                            <select
                                name='supplier'
                                value={formData.supplier}
                                onChange={handleChange}
                                className='border p-2 rounded'
                                required
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(sup => (
                                    <option key={sup._id} value={sup._id}>{sup.name}</option>
                                ))}
                            </select>
                            <input
                                type='number'
                                name='price'
                                value={formData.price}
                                onChange={handleChange}
                                placeholder='Price'
                                className='border p-2 rounded'
                                required
                            />
                            <input
                                type='number'
                                name='quantity'
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder='Stock'
                                className='border p-2 rounded'
                                required
                            />
                            <input
                                type='text'
                                name='description'
                                value={formData.description}
                                onChange={handleChange}
                                placeholder='Description'
                                className='border p-2 rounded'
                            />
                            <div className="flex space-x-2">
                                <button
                                    type='submit'
                                    className='w-full rounded-md bg-green-500 text-white p-3 cursor-pointer hover:bg-green-600'
                                >
                                    {editProductId ? "Save Changes" : "Add Product"}
                                </button>
                                <button
                                    type="button"
                                    className='w-full rounded-md bg-gray-500 text-white p-3 cursor-pointer hover:bg-gray-600'
                                    onClick={closeModal}
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