import React, { useEffect, useState } from 'react';
import API from '../utils/api';
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
            const response = await API.get('/category');
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
                const response = await API.put(`/category/${editCategoryId}`, 
                    { categoryName, categoryDescription }
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
                const response = await API.post('/category/add',
                    { categoryName, categoryDescription }
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
        const confirmMessage = "Are you sure you want to delete this category?\n\nWARNING: This will also permanently delete ALL products associated with this category!";
        if (window.confirm(confirmMessage)) {
            try {
                const response = await API.delete(`/category/${id}`);
                if (response.data.success) {
                    alert(response.data.message || 'Category deleted successfully');
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="relative mb-8 animate-fadeInDown">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-relaxed pb-1">
                        Categories Management
                    </h1>
                    <p className="text-gray-600 text-lg">Manage your product categories and organize your inventory</p>
                </div>
            </div>

            {/* Search and Add Button */}
            <div className="relative flex flex-col md:flex-row gap-6 mb-8 animate-fadeInUp">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl z-10" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400 shadow-lg"
                    />
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                >
                    <FaPlus className="text-xl" />
                    Add Category
                </button>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64 animate-fadeInUp">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                        <div className="text-2xl text-gray-600 font-semibold">Loading categories...</div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeInUp">
                    {filteredCategories.map((category, index) => (
                        <div 
                            key={category._id} 
                            className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${getRandomColor(index)} shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                    <FaTags className="text-white text-2xl" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                                    >
                                        <FaEdit className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                                    >
                                        <FaTrash className="text-lg" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                                {category.categoryName}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                {category.categoryDescription || 'No description available'}
                            </p>
                            <div className="text-xs text-gray-500 bg-gray-100/50 rounded-lg p-2 font-mono">
                                ID: {category._id.slice(-8)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredCategories.length === 0 && (
                <div className="text-center py-16 animate-fadeInUp">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md mx-auto">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <FaTags className="text-4xl text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No categories found</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {search ? 'Try adjusting your search terms' : 'Get started by adding your first category'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setModalOpen(true)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 mx-auto transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <FaPlus />
                                Add Category
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl border border-white/20 animate-slideInUp">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                {editCategoryId ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100/50 transition-all duration-200 hover:scale-110"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Description
                                </label>
                                <textarea
                                    value={categoryDescription}
                                    onChange={(e) => setCategoryDescription(e.target.value)}
                                    rows="4"
                                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400 resize-none"
                                    placeholder="Enter category description"
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {editCategoryId ? 'Update Category' : 'Add Category'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-200/80 backdrop-blur-lg hover:bg-gray-300/80 text-gray-800 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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