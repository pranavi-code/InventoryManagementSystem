import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTags, FaTimes } from 'react-icons/fa';

const Categories = () => {
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3000/api/category', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                },
            });
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle add/edit submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editCategoryId) {
                // Edit category
                const response = await axios.put(
                    `http://localhost:3000/api/category/${editCategoryId}`,
                    { categoryName, categoryDescription },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                        },
                    }
                );
                if (response.data.success) {
                    alert('Category updated successfully');
                    setEditCategoryId(null);
                    setModalOpen(false);
                    setCategoryName('');
                    setCategoryDescription('');
                    fetchCategories();
                } else {
                    alert(response.data.error || 'Failed to update category');
                }
            } else {
                // Add category
                const response = await axios.post(
                    'http://localhost:3000/api/category/add',
                    { categoryName, categoryDescription },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                        },
                    }
                );
                if (response.data.success) {
                    alert('Category added successfully');
                    setModalOpen(false);
                    setCategoryName('');
                    setCategoryDescription('');
                    fetchCategories();
                } else {
                    alert(response.data.error || 'Failed to add category');
                }
            }
        } catch (error) {
            alert('Error saving category');
            console.error(error);
        }
    };

    // Handle edit
    const handleEdit = (cat) => {
        setCategoryName(cat.categoryName);
        setCategoryDescription(cat.categoryDescription);
        setEditCategoryId(cat._id);
        setModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/category/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                    },
                });
                if (response.data.success) {
                    alert('Category deleted successfully');
                    fetchCategories();
                } else {
                    alert(response.data.error || 'Failed to delete category');
                }
            } catch (error) {
                alert('Error deleting category');
                console.error(error);
            }
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditCategoryId(null);
        setCategoryName('');
        setCategoryDescription('');
    };

    const filteredCategories = categories.filter(cat =>
        cat.categoryName.toLowerCase().includes(search.toLowerCase()) ||
        cat.categoryDescription.toLowerCase().includes(search.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
                <p className="text-gray-600">Manage your product categories and organize your inventory</p>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
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
                    Add Category
                </button>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">Loading categories...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCategories.map((category, index) => (
                        <div key={category._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${getRandomColor(index)}`}>
                                    <FaTags className="text-white text-xl" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{category.categoryName}</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                {category.categoryDescription || 'No description available'}
                            </p>
                            <div className="text-xs text-gray-500">
                                ID: {category._id.slice(-8)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <FaTags className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories found</h3>
                    <p className="text-gray-500 mb-4">
                        {search ? 'Try adjusting your search terms' : 'Get started by adding your first category'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors duration-200"
                        >
                            <FaPlus />
                            Add Category
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
                                {editCategoryId ? 'Edit Category' : 'Add New Category'}
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
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={categoryDescription}
                                    onChange={(e) => setCategoryDescription(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter category description"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                                >
                                    {editCategoryId ? 'Update Category' : 'Add Category'}
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

export default Categories;