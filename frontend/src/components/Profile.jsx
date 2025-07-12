import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { FaUser, FaEnvelope, FaUserTag, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const Profile = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await API.put(
                `/user/${user.id}`,
                {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                }
            );

            if (response.data.success) {
                // Update the user context with new data
                const updatedUser = {
                    ...user,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                };
                login(updatedUser, localStorage.getItem('pos-token'));
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert(response.data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        }
        
        setLoading(false);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('New password must be at least 6 characters long!');
            return;
        }

        setLoading(true);
        
        try {
            const response = await API.put(
                `/user/${user.id}/password`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }
            );

            if (response.data.success) {
                alert('Password updated successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);
            } else {
                alert(response.data.error || 'Failed to update password');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Error updating password. Please try again.');
        }
        
        setLoading(false);
    };

    const cancelEdit = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || ''
        });
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">No user data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Management</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaUser className="text-4xl text-gray-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{user.name}</h2>
                        <p className="text-gray-600 mb-2">{user.email}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                        }`}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <FaEdit className="mr-2" />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleProfileUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaUser className="inline mr-2" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-3 py-2 border rounded-lg ${
                                            isEditing 
                                                ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaEnvelope className="inline mr-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-3 py-2 border rounded-lg ${
                                            isEditing 
                                                ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaUserTag className="inline mr-2" />
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || user.role !== 'admin'}
                                        className={`w-full px-3 py-2 border rounded-lg ${
                                            isEditing && user.role === 'admin'
                                                ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {user.role !== 'admin' && (
                                        <p className="text-sm text-gray-500 mt-1">Only admins can change roles</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FaTimes className="mr-2" />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        <FaSave className="mr-2" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Password Change Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Security</h3>
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                Change Password
                            </button>
                        </div>

                        {showPasswordForm && (
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;