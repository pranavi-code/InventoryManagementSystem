import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { Link } from 'react-router';
import {
    FaUser,
    FaEnvelope,
    FaLock, 
    FaEdit, 
    FaSave, 
    FaTimes,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

const EmployeeProfile = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [orderStats, setOrderStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        delivered: 0,
        totalSpent: 0
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrderStats();
    }, []);

    const fetchOrderStats = async () => {
        try {
            const response = await API.get('/order/stats');
            const stats = response.data.stats || [];
            
            const statsObj = {
                total: stats.reduce((sum, stat) => sum + stat.count, 0),
                pending: stats.find(s => s._id === 'Pending')?.count || 0,
                approved: stats.find(s => s._id === 'Approved')?.count || 0,
                delivered: stats.find(s => s._id === 'Delivered')?.count || 0,
                totalSpent: stats.reduce((sum, stat) => sum + (stat.totalAmount || 0), 0)
            };
            
            setOrderStats(statsObj);
        } catch (error) {
            console.error('Error fetching order stats:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await API.put(
                `/user/${user.id}`,
                profileForm
            );

            if (response.data.success) {
                // Update the user context with new data
                const updatedUser = { ...user, ...profileForm };
                login(updatedUser, localStorage.getItem('pos-token'));
                
                alert('Profile updated successfully!');
                setIsEditing(false);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            await API.put(
                `/user/${user.id}/password`,
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                }
            );

            alert('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (error) {
            alert(error.response?.data?.error || 'Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setProfileForm({
            name: user?.name || '',
            email: user?.email || ''
        });
        setIsEditing(false);
    };

    const cancelPasswordChange = () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                                >
                                    <FaEdit className="mr-2" />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleProfileUpdate}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                                            }`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                                            }`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value="Employee"
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-600"
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                                        >
                                            <FaSave className="mr-2" />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                                        >
                                            <FaTimes className="mr-2" />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Password Change Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                            {!showPasswordForm && (
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
                                >
                                    <FaLock className="mr-2" />
                                    Change Password
                                </button>
                            )}
                        </div>

                        {showPasswordForm ? (
                            <form onSubmit={handlePasswordChange}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                                        >
                                            <FaSave className="mr-2" />
                                            {loading ? 'Changing...' : 'Change Password'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelPasswordChange}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                                        >
                                            <FaTimes className="mr-2" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="text-gray-600">
                                <p>Keep your account secure by using a strong password.</p>
                                <p className="text-sm mt-2">Last password change: Not available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    {/* Account Summary */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Member Since</span>
                                <span className="font-medium">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">User ID</span>
                                <span className="font-medium text-sm">#{user?.id?.slice(-8) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Status</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Statistics */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Orders</span>
                                <span className="font-bold text-blue-600">{orderStats.total}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Pending</span>
                                <span className="font-medium text-yellow-600">{orderStats.pending}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Approved</span>
                                <span className="font-medium text-green-600">{orderStats.approved}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Delivered</span>
                                <span className="font-medium text-green-600">{orderStats.delivered}</span>
                            </div>
                            <hr className="my-3" />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Spent</span>
                                <span className="font-bold text-green-600">${orderStats.totalSpent.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/employee/order-history" className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors block">
                                View Order History
                            </Link>
                            <Link to="/employee/place-order" className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors block">
                                Place New Order
                            </Link>
                            <Link to="/employee/products" className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors block">
                                Browse Products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;