import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    // Handle modal close
    const closeModal = () => {
        setModalOpen(false);
        setEditSupplierId(null);
        setFormData({ name: "", email: "", number: "", address: "" });
    };

    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-8'>Supplier Management</h1>
            <div className='flex justify-between items-center mb-4'>
                <input
                    type="text"
                    placeholder="Search Supplier"
                    className="border p-2 rounded w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className='px-4 py-2 bg-blue-500 text-white rounded cursor-pointer'
                    onClick={() => { setModalOpen(true); setEditSupplierId(null); setFormData({ name: "", email: "", number: "", address: "" }); }}
                >
                    Add Supplier
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
                            <th className="border border-gray-300 p-2">Email</th>
                            <th className="border border-gray-300 p-2">Phone Number</th>
                            <th className="border border-gray-300 p-2">Address</th>
                            <th className="border border-gray-300 p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers
                            .filter(sup => sup.name.toLowerCase().includes(search.toLowerCase()))
                            .map((supplier, index) => (
                                <tr key={supplier._id}>
                                    <td className="border border-gray-300 p-2">{index + 1}</td>
                                    <td className="border border-gray-300 p-2">{supplier.name}</td>
                                    <td className="border border-gray-300 p-2">{supplier.email}</td>
                                    <td className="border border-gray-300 p-2">{supplier.number}</td>
                                    <td className="border border-gray-300 p-2">{supplier.address}</td>
                                    <td className="border border-gray-300 p-2">
                                        <button
                                            className='px-2 py-1 bg-yellow-500 text-white rounded mr-2'
                                            onClick={() => handleEdit(supplier)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className='px-2 py-1 bg-red-500 text-white rounded'
                                            onClick={() => handleDelete(supplier._id)}
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
                        <h2 className='text-xl font-bold mb-4'>{editSupplierId ? "Edit Supplier" : "Add Supplier"}</h2>
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
                                placeholder='Supplier Name'
                                className='border p-2 rounded'
                                required
                            />
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='Supplier Email'
                                className='border p-2 rounded'
                                required
                            />
                            <input
                                type='text'
                                name='number'
                                value={formData.number}
                                onChange={handleChange}
                                placeholder='Supplier Phone Number'
                                className='border p-2 rounded'
                                required
                            />
                            <input
                                type='text'
                                name='address'
                                value={formData.address}
                                onChange={handleChange}
                                placeholder='Supplier Address'
                                className='border p-2 rounded'
                                required
                            />
                            <div className="flex space-x-2">
                                <button
                                    type='submit'
                                    className='w-full rounded-md bg-green-500 text-white p-3 cursor-pointer hover:bg-green-600'
                                >
                                    {editSupplierId ? "Save Changes" : "Add Supplier"}
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

export default Suppliers;