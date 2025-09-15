import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { FaUser, FaEnvelope, FaUserTag, FaEdit, FaSave, FaTimes, FaLock, FaUserShield, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router';

const Profile = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

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
        setErrorMessage('');
        
        try {
            const userId = user.id || user._id;
            const response = await API.put(
                `/user/${userId}`,
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
                setSuccessMessage('Profile updated successfully! ✨');
            } else {
                setErrorMessage(response.data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage('Error updating profile. Please try again.');
        }
        
        setLoading(false);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('New passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setErrorMessage('New password must be at least 6 characters long!');
            return;
        }

        setPasswordLoading(true);
        setErrorMessage('');
        
        try {
            const userId = user.id || user._id;
            const response = await API.put(
                `/user/${userId}/password`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }
            );

            if (response.data.success) {
                setSuccessMessage('Password updated successfully! 🎉');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);
            } else {
                setErrorMessage(response.data.error || 'Failed to update password');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            if (error.response?.data?.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Error updating password. Please try again.');
            }
        }
        
        setPasswordLoading(false);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
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
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No user data available</p>
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

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideInRight">
                    <FaCheckCircle className="mr-2" />
                    {successMessage}
                </div>
            )}
            
            {errorMessage && (
                <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideInRight">
                    <FaTimes className="mr-2" />
                    {errorMessage}
                </div>
            )}

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="relative mb-8 animate-fadeInDown">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-relaxed pb-1">
                                    Profile Management
                                </h1>
                                <p className="text-gray-600 text-lg">Manage your account settings and security</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeInUp">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 animate-fadeInLeft">
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse-glow">
                                    <FaUser className="text-5xl text-white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                                    <FaUserShield className="text-white text-sm" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
                            <p className="text-gray-600 mb-4 break-all">{user.email}</p>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg ${
                                user.role === 'admin' 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                                    : 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                            }`}>
                                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="lg:col-span-2 animate-fadeInRight">
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-500">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                        <FaUser className="mr-3 text-purple-600" />
                                        Profile Information
                                    </h3>
                                    <p className="text-gray-600 mt-1">Update your personal details</p>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <FaEdit className="mr-2" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleProfileUpdate}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            <FaUser className="inline mr-2 text-purple-600" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-6 py-4 border-2 rounded-2xl transition-all duration-300 text-lg ${
                                                isEditing 
                                                    ? 'border-white/50 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-lg placeholder-gray-400' 
                                                    : 'border-gray-200 bg-gray-50/80 backdrop-blur-lg'
                                            }`}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            <FaEnvelope className="inline mr-2 text-blue-600" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-6 py-4 border-2 rounded-2xl transition-all duration-300 text-lg ${
                                                isEditing 
                                                    ? 'border-white/50 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg placeholder-gray-400' 
                                                    : 'border-gray-200 bg-gray-50/80 backdrop-blur-lg'
                                            }`}
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            <FaUserTag className="inline mr-2 text-green-600" />
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || user.role !== 'admin'}
                                            className={`w-full px-6 py-4 border-2 rounded-2xl transition-all duration-300 text-lg ${
                                                isEditing && user.role === 'admin'
                                                    ? 'border-white/50 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-lg' 
                                                    : 'border-gray-200 bg-gray-50/80 backdrop-blur-lg'
                                            }`}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {user.role !== 'admin' && (
                                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                                                <FaLock className="mr-1" />
                                                Only admins can change roles
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end space-x-4 mt-8 animate-slideInUp">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold hover:scale-105"
                                        >
                                            <FaTimes className="mr-2" />
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            <FaSave className="mr-2" />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Password Change Section */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mt-8 border border-white/20 hover:shadow-3xl transition-all duration-500">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                        <FaLock className="mr-3 text-red-600" />
                                        Security Settings
                                    </h3>
                                    <p className="text-gray-600 mt-1">Manage your password and security</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <FaLock className="mr-2" />
                                    Change Password
                                </button>
                            </div>

                            {showPasswordForm && (
                                <form onSubmit={handlePasswordUpdate} className="space-y-6 animate-slideInUp">
                                    <div className="transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            <FaLock className="inline mr-2 text-gray-600" />
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            <FaUserShield className="inline mr-2 text-green-600" />
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="Enter new password (min 6 characters)"
                                            required
                                            minLength="6"
                                        />
                                    </div>
                                    
                                    <div className="transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            <FaCheckCircle className="inline mr-2 text-blue-600" />
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-lg transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="Confirm your new password"
                                            required
                                            minLength="6"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-4 pt-4">
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
                                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold hover:scale-105"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            <FaUserShield className="mr-2" />
                                            {passwordLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
                    50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
                }
                
                .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
                .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
                .animate-fadeInLeft { animation: fadeInLeft 0.8s ease-out; }
                .animate-fadeInRight { animation: fadeInRight 0.8s ease-out; }
                .animate-slideInUp { animation: slideInUp 0.5s ease-out; }
                .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default Profile;