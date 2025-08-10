import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTruck, FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Suppliers = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        number: "",
        address: "",
    });
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editSupplierId, setEditSupplierId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch suppliers
    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3000/api/supplier', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                },
            });
            setSuppliers(response.data.suppliers || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle add/edit submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editSupplierId) {
                // Edit supplier
                const response = await axios.put(
                    `http://localhost:3000/api/supplier/${editSupplierId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                        },
                    }
                );
                if (response.data.success) {
                    alert('Supplier updated successfully');
                    setEditSupplierId(null);
                    setModalOpen(false);
                    setFormData({ name: "", email: "", number: "", address: "" });
                    fetchSuppliers();
                } else {
                    alert(response.data.error || 'Failed to update supplier');
                }
            } else {
                // Add supplier
                const response = await axios.post(
                    'http://localhost:3000/api/supplier/add',
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                        },
                    }
                );
                if (response.data.success) {
                    alert('Supplier added successfully');
                    setModalOpen(false);
                    setFormData({ name: "", email: "", number: "", address: "" });
                    fetchSuppliers();
                } else {
                    alert(response.data.error || 'Failed to add supplier');
                }
            }
        } catch (error) {
            alert('Error saving supplier');
            console.error(error);
        }
    };

    // Handle edit
    const handleEdit = (supplier) => {
        setFormData({
            name: supplier.name,
            email: supplier.email,
            number: supplier.number,
            address: supplier.address,
        });
        setEditSupplierId(supplier._id);
        setModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/supplier/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                    },
                });
                if (response.data.success) {
                    alert('Supplier deleted successfully');
                    fetchSuppliers();
                } else {
                    alert(response.data.error || 'Failed to delete supplier');
                }
            } catch (error) {
                alert('Error deleting supplier');
                console.error(error);
            }
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditSupplierId(null);
        setFormData({ name: "", email: "", number: "", address: "" });
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email.toLowerCase().includes(search.toLowerCase()) ||
        supplier.number.includes(search) ||
        supplier.address.toLowerCase().includes(search.toLowerCase())
    );

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Suppliers Management</h1>
                <p className="text-gray-600">Manage your suppliers and vendor relationships</p>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                    <FaPlus />
                    Add Supplier
                </button>
            </div>

            {/* Suppliers Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">Loading suppliers...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSuppliers.map((supplier, index) => (
                        <div key={supplier._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${getRandomColor(index)}`}>
                                    <FaTruck className="text-white text-xl" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(supplier)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supplier._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{supplier.name}</h3>
                            
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <FaEnvelope className="text-gray-400" />
                                    <span className="text-gray-600">{supplier.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <FaPhone className="text-gray-400" />
                                    <span className="text-gray-600">{supplier.number}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                    <span className="text-gray-600">{supplier.address}</span>
                                </div>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                                ID: {supplier._id.slice(-8)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredSuppliers.length === 0 && (
                <div className="text-center py-12">
                    <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No suppliers found</h3>
                    <p className="text-gray-500 mb-4">
                        {search ? 'Try adjusting your search terms' : 'Get started by adding your first supplier'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors duration-200"
                        >
                            <FaPlus />
                            Add Supplier
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editSupplierId ? 'Edit Supplier' : 'Add New Supplier'}
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
                                    Supplier Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter supplier name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter address"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                                >
                                    {editSupplierId ? 'Update Supplier' : 'Add Supplier'}
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

export default Suppliers;