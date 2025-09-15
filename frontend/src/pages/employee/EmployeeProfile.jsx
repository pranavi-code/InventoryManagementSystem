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
            // Fetch orders directly and calculate stats from them for more reliable data
            const ordersRes = await API.get('/order');
            const userOrders = ordersRes.data.orders || [];
            
            console.log('Fetched orders for profile stats:', userOrders.length);
            
            // Calculate stats directly from orders for reliable data
            const processedStats = {
                total: userOrders.length,
                pending: userOrders.filter(order => order.status === 'Pending').length,
                approved: userOrders.filter(order => order.status === 'Approved').length,
                delivered: userOrders.filter(order => order.status === 'Delivered').length,
                totalSpent: userOrders.reduce((total, order) => {
                    // Only count delivered orders for total spent (actual money spent)
                    if (order.status === 'Delivered') {
                        const orderTotal = order.totalAmount || (order.product?.price * order.quantity) || 0;
                        console.log('Adding order total:', orderTotal, 'for delivered order:', order._id?.slice(-8));
                        return total + orderTotal;
                    }
                    return total;
                }, 0)
            };

            console.log('Calculated stats from orders:', processedStats);
            
            setOrderStats(processedStats);
        } catch (error) {
            console.error('Error fetching order stats:', error);
            // Set default values if API fails
            setOrderStats({
                total: 0,
                pending: 0,
                approved: 0,
                delivered: 0,
                totalSpent: 0
            });
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            My Profile
                        </h1>
                        <p className="text-gray-600 text-lg">Manage your account information and preferences with ease</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                                    >
                                        <FaEdit />
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleProfileUpdate}>
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                                disabled={!isEditing}
                                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg ${
                                                    isEditing ? 'border-white/50 bg-white/80 backdrop-blur-lg' : 'border-white/30 bg-white/40 backdrop-blur-lg text-gray-700'
                                                }`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                                disabled={!isEditing}
                                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg ${
                                                    isEditing ? 'border-white/50 bg-white/80 backdrop-blur-lg' : 'border-white/30 bg-white/40 backdrop-blur-lg text-gray-700'
                                                }`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Role
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value="Employee"
                                                disabled
                                                className="w-full px-4 py-4 border-2 border-white/30 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-lg rounded-2xl text-gray-700 font-semibold text-lg"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex space-x-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50"
                                            >
                                                <FaSave />
                                                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="px-8 py-4 border-2 border-white/50 text-gray-700 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-lg flex items-center space-x-2"
                                            >
                                                <FaTimes />
                                                <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Password Change Section */}
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mt-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Security</h2>
                            {!showPasswordForm && (
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                                >
                                    <FaLock />
                                    <span>Change Password</span>
                                </button>
                            )}
                        </div>

                        {showPasswordForm ? (
                            <form onSubmit={handlePasswordChange}>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                                className="w-full pl-12 pr-12 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                            >
                                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                className="w-full pl-12 pr-12 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                                required
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                            >
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                className="w-full pl-12 pr-12 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg"
                                                required
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50"
                                        >
                                            <FaSave />
                                            <span>{loading ? 'Changing...' : 'Change Password'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelPasswordChange}
                                            className="px-8 py-4 border-2 border-white/50 text-gray-700 rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-lg flex items-center space-x-2"
                                        >
                                            <FaTimes />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="text-gray-600 bg-gradient-to-r from-gray-50/80 to-blue-50/80 p-6 rounded-2xl border border-gray-100">
                                <p className="font-semibold">Keep your account secure by using a strong password.</p>
                                <p className="text-sm mt-2">Last password change: Not available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-8">
                    {/* Account Summary */}
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">Account Summary</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <span className="text-gray-700 font-semibold">Member Since</span>
                                <span className="font-bold text-gray-900">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 
                                     user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 
                                     new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <span className="text-gray-700 font-semibold">User ID</span>
                                <span className="font-bold text-blue-600 text-sm">#{(user?.id || user?._id)?.slice(-8) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <span className="text-gray-700 font-semibold">Status</span>
                                <span className="px-3 py-1 rounded-full text-sm font-bold shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Statistics */}
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Order Statistics</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <span className="text-gray-700 font-semibold">Total Orders</span>
                                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{orderStats.total}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <span className="text-gray-700 font-semibold">Pending</span>
                                <span className="font-bold text-xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{orderStats.pending}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <span className="text-gray-700 font-semibold">Approved</span>
                                <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{orderStats.approved}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <span className="text-gray-700 font-semibold">Delivered</span>
                                <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{orderStats.delivered}</span>
                            </div>
                            <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl p-4 border border-green-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-700 font-bold">Total Spent</span>
                                    <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${orderStats.totalSpent.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
    // JSX structure is now balanced
};

export default EmployeeProfile;