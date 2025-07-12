import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    // Handle modal close
    const closeModal = () => {
        setModalOpen(false);
        setEditCategoryId(null);
        setCategoryName('');
        setCategoryDescription('');
    };

    // Filtered categories by search
    const filteredCategories = categories.filter(cat =>
        cat.categoryName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-8'>Category Management</h1>
            <div className='flex justify-between items-center mb-4'>
                <input
                    type="text"
                    placeholder="Search Category"
                    className="border p-2 rounded w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className='px-4 py-2 bg-blue-500 text-white rounded cursor-pointer'
                    onClick={() => { setModalOpen(true); setEditCategoryId(null); setCategoryName(''); setCategoryDescription(''); }}
                >
                    Add Category
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
                            <th className="border border-gray-300 p-2">Description</th>
                            <th className="border border-gray-300 p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map((cat, index) => (
                            <tr key={cat._id}>
                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                <td className="border border-gray-300 p-2">{cat.categoryName}</td>
                                <td className="border border-gray-300 p-2">{cat.categoryDescription}</td>
                                <td className="border border-gray-300 p-2">
                                    <button
                                        className='px-2 py-1 bg-yellow-500 text-white rounded mr-2'
                                        onClick={() => handleEdit(cat)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className='px-2 py-1 bg-red-500 text-white rounded'
                                        onClick={() => handleDelete(cat._id)}
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
                        <h2 className='text-xl font-bold mb-4'>{editCategoryId ? "Edit Category" : "Add Category"}</h2>
                        <button
                            className='absolute top-4 right-4 font-bold text-lg cursor-pointer'
                            onClick={closeModal}
                        >
                            X
                        </button>
                        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                            <input
                                type='text'
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                placeholder='Category Name'
                                className='border p-2 rounded'
                                required
                            />
                            <input
                                type='text'
                                value={categoryDescription}
                                onChange={e => setCategoryDescription(e.target.value)}
                                placeholder='Category Description'
                                className='border p-2 rounded'
                                required
                            />
                            <div className="flex space-x-2">
                                <button
                                    type='submit'
                                    className='w-full rounded-md bg-green-500 text-white p-3 cursor-pointer hover:bg-green-600'
                                >
                                    {editCategoryId ? "Save Changes" : "Add Category"}
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

export default Categories;