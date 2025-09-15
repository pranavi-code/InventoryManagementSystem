import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTimes, FaCrown, FaUserTie, FaCircle, FaUsers, FaUserShield } from 'react-icons/fa';

const Employees = () => {
    const { user: currentUser, socket } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'employee',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
        
        // Use socket from AuthContext if available
        if (socket && currentUser) {
            console.log('Using socket from AuthContext for user tracking');
            
            // Add current user as online immediately
            const userId = String(currentUser.id || currentUser._id);
            setOnlineUsers(prev => new Set([...prev, userId]));

            const handleUserOnline = (userId) => {
                console.log('User came online:', userId);
                setOnlineUsers(prev => new Set([...prev, String(userId)]));
                // Update users list to set isActive to true
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        String(user._id) === String(userId) 
                            ? { ...user, isActive: true } 
                            : user
                    )
                );
            };
            
            const handleUserOffline = (userId) => {
                console.log('User went offline:', userId);
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(String(userId));
                    return newSet;
                });
                // Update users list to set isActive to false
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        String(user._id) === String(userId) 
                            ? { ...user, isActive: false } 
                            : user
                    )
                );
            };

            socket.on('user_online', handleUserOnline);
            socket.on('user_offline', handleUserOffline);

            // Refresh user data every 30 seconds to get updated status
            const interval = setInterval(fetchUsers, 30000);
            
            return () => {
                clearInterval(interval);
                socket.off('user_online', handleUserOnline);
                socket.off('user_offline', handleUserOffline);
            };
        }
    }, [socket, currentUser]);

    const fetchUsers = async () => {
        try {
            const response = await API.get('/user');
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await API.put(`/user/${editingUser._id}`, formData);
            } else {
                await API.post('/user/add', formData);
            }
            setShowAddModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', phone: '', role: 'employee', password: '' });
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user. Please try again.');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            password: ''
        });
        setShowAddModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await API.delete(`/user/${userId}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user. Please try again.');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', phone: '', role: 'employee', password: '' });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-600';
            case 'employee': return 'bg-gradient-to-r from-blue-500 to-indigo-600';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
        }
    };

    const getAvatarColor = (index) => {
        const colors = [
            'bg-gradient-to-r from-purple-500 to-pink-500',
            'bg-gradient-to-r from-blue-500 to-cyan-500',
            'bg-gradient-to-r from-green-500 to-teal-500',
            'bg-gradient-to-r from-yellow-500 to-orange-500',
            'bg-gradient-to-r from-red-500 to-pink-500',
            'bg-gradient-to-r from-indigo-500 to-purple-500',
            'bg-gradient-to-r from-emerald-500 to-green-500'
        ];
        return colors[index % colors.length];
    };

    const getOnlineStatusColor = (userId) => {
        const user = users.find(u => u._id === userId);
        const userIdStr = String(userId);
        const isOnlineSocket = onlineUsers.has(userIdStr);
        const isActiveDB = user?.isActive;
        
        console.log('Status check for user:', userIdStr, 'Socket:', isOnlineSocket, 'DB:', isActiveDB);
        return (isOnlineSocket || isActiveDB) ? 'text-green-400' : 'text-gray-400';
    };

    const getStatusText = (userId) => {
        const user = users.find(u => u._id === userId);
        const userIdStr = String(userId);
        const isOnlineSocket = onlineUsers.has(userIdStr);
        const isActiveDB = user?.isActive;
        
        // Debug logging for roopika user
        if (user?.name?.toLowerCase() === 'roopika') {
            console.log('Roopika status check:', {
                userId: userIdStr,
                isOnlineSocket,
                isActiveDB,
                onlineUsersSet: Array.from(onlineUsers),
                userName: user.name
            });
        }
        
        return (isOnlineSocket || isActiveDB) ? 'Online' : 'Offline';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="relative mb-8 animate-fadeInDown">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-relaxed pb-1">
                        Employee Management
                    </h1>
                    <p className="text-gray-600 text-lg">Manage your team members and their access levels</p>
                </div>
            </div>

            <div className="relative">
                {/* Search, Filter, and Add Button */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8 animate-fadeInUp">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-white/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg transition-all duration-300"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-6 py-4 border-2 border-white/50 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                    </select>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <FaPlus />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeInUp">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaUsers className="text-2xl text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                            <p className="text-3xl font-bold text-gray-800">{filteredUsers.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaCircle className="text-2xl text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-600 text-sm font-medium">Online Now</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {filteredUsers.filter(user => onlineUsers.has(user._id) || user.isActive).length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FaUserShield className="text-2xl text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-600 text-sm font-medium">Admins</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {filteredUsers.filter(user => user.role === 'admin').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
                {filteredUsers.map((user, index) => (
                    <div 
                        key={user._id} 
                        className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className={`w-16 h-16 ${getAvatarColor(index)} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <FaCircle className={`text-xs ${getOnlineStatusColor(user._id)}`} />
                                        <span className={`text-sm font-medium ${getOnlineStatusColor(user._id) === 'text-green-400' ? 'text-green-600' : 'text-gray-500'}`}>
                                            {getStatusText(user._id)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                                >
                                    <FaEdit className="text-sm" />
                                </button>
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                                >
                                    <FaTrash className="text-sm" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                                <FaEnvelope className="w-4 h-4 mr-3" />
                                <span className="text-sm break-all">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center text-gray-600">
                                    <FaPhone className="w-4 h-4 mr-3" />
                                    <span className="text-sm">{user.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${getRoleColor(user.role)}`}>
                                {user.role === 'admin' ? <FaCrown className="mr-2" /> : <FaUserTie className="mr-2" />}
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12 animate-fadeInUp">
                    <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No employees found</p>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 transform animate-slideInUp">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {editingUser ? 'Edit Employee' : 'Add New Employee'}
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
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                    placeholder="Enter phone number (optional)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Role *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                        placeholder="Enter password (min 6 characters)"
                                        required={!editingUser}
                                        minLength="6"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-200/80 backdrop-blur-lg hover:bg-gray-300/80 text-gray-800 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {editingUser ? 'Update' : 'Add'} Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideInUp { animation: slideInUp 0.5s ease-out; }
            `}</style>
            </div>
        </div>
    );
};

export default Employees;