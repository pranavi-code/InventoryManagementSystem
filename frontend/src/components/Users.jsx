import React, { useEffect, useState } from 'react';
import axios from 'axios';

const initialForm = { name: '', email: '', password: '', role: 'employee' };

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3000/api/user', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                },
            });
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (editUserId) {
                // Edit user (do not send password)
                const response = await axios.put(
                    `http://localhost:3000/api/user/${editUserId}`,
                    { name: formData.name, email: formData.email, role: formData.role },
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` },
                    }
                );
                if (response.data.success) {
                    alert('User updated!');
                    setModalOpen(false);
                    setEditUserId(null);
                    setFormData(initialForm);
                    fetchUsers();
                } else {
                    alert(response.data.error || 'Failed to update user');
                }
            } else {
                // Add user (send password)
                const response = await axios.post(
                    'http://localhost:3000/api/user/add',
                    formData,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` },
                    }
                );
                if (response.data.success) {
                    alert('User added!');
                    setModalOpen(false);
                    setFormData(initialForm);
                    fetchUsers();
                } else {
                    alert(response.data.error || 'Failed to add user');
                }
            }
        } catch (error) {
            alert('Error saving user');
            console.error(error);
        }
    };

    const handleEdit = user => {
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setEditUserId(user._id);
        setModalOpen(true);
    };

    const handleDelete = async id => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/user/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` },
                });
                if (response.data.success) {
                    alert('User deleted!');
                    fetchUsers();
                } else {
                    alert(response.data.error || 'Failed to delete user');
                }
            } catch (error) {
                alert('Error deleting user');
                console.error(error);
            }
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditUserId(null);
        setFormData(initialForm);
    };

    const filteredUsers = users.filter(
        user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-8">Employee Management</h1>
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Search Employee"
                    className="border p-2 rounded w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                    onClick={() => { setModalOpen(true); setEditUserId(null); setFormData(initialForm); }}
                >
                    Add Employee
                </button>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredUsers.map(user => (
                        <div key={user._id} className="bg-white rounded shadow-md p-4 flex flex-col items-center relative">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold mb-2">
                                {user.name[0].toUpperCase()}
                            </div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-gray-600">{user.email}</div>
                            <div className="text-sm text-gray-500 mb-2 capitalize">{user.role === 'employee' ? 'Employee' : user.role}</div>
                            <div className={`mb-2 text-xs font-semibold ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </div>
                            <div className="flex space-x-2 absolute top-2 right-2">
                                <button
                                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                                    onClick={() => handleEdit(user)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                    onClick={() => handleDelete(user._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
                        <h2 className="text-xl font-bold mb-4">{editUserId ? "Edit Employee" : "Add Employee"}</h2>
                        <button
                            className="absolute top-4 right-4 font-bold text-lg cursor-pointer"
                            onClick={closeModal}
                        >
                            X
                        </button>
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Name"
                                className="border p-2 rounded"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="border p-2 rounded"
                                required
                            />
                            {!editUserId && (
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="border p-2 rounded"
                                    required
                                />
                            )}
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="border p-2 rounded"
                                required
                            >
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-green-500 text-white p-3 cursor-pointer hover:bg-green-600"
                                >
                                    {editUserId ? "Save Changes" : "Add Employee"}
                                </button>
                                <button
                                    type="button"
                                    className="w-full rounded-md bg-gray-500 text-white p-3 cursor-pointer hover:bg-gray-600"
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

export default Users;