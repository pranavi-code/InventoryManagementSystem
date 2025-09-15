import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, User, Shield, Sparkles, ArrowRight, KeyRound } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        setMounted(true);
        // Load saved email if remember me was checked
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });
            if (response.data.success) {
                // Save email if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                await login(response.data.user, response.data.token);
                
                // Add success animation before redirect
                setTimeout(() => {
                    if (response.data.user.role === 'admin') {
                        navigate('/admin-dashboard');
                    } else {
                        navigate('/employee-dashboard');
                    }
                }, 1000);
            } else {
                setError(response.data.error);
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message);
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            // This would typically send to your backend
            console.log('Password reset requested for:', forgotEmail);
            setResetSent(true);
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetSent(false);
                setForgotEmail('');
            }, 3000);
        } catch (error) {
            console.error('Error sending reset email:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            <div className={`max-w-md w-full transform transition-all duration-1000 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <div className="text-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/25 animate-pulse-glow">
                            <Shield className="w-12 h-12 text-white animate-float" />
                        </div>
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-twinkle" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3 animate-gradient">
                        Welcome Back
                    </h1>
                    <p className="text-gray-300 text-lg">Inventory Management System</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
                    {/* Glass effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        {!showForgotPassword ? (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                                    <p className="text-gray-300">Enter your credentials to continue</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake">
                                        <p className="text-red-300 text-sm flex items-center">
                                            <Shield className="w-4 h-4 mr-2" />
                                            {error}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-purple-400" />
                                            <input
                                                type="email"
                                                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                                                name="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@inventory.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="transform transition-all duration-300 hover:scale-105">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-purple-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                                                name="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center transform transition-all duration-300 hover:scale-105">
                                            <input
                                                type="checkbox"
                                                id="remember"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded bg-white/10 backdrop-blur-sm"
                                            />
                                            <label htmlFor="remember" className="ml-3 block text-sm text-gray-300">
                                                Remember me
                                            </label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            className="text-sm text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-105 flex items-center"
                                        >
                                            <KeyRound className="w-4 h-4 mr-1" />
                                            Forgot password?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center group"
                                    >
                                        {loading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                Signing in...
                                            </div>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            // Forgot Password Form
                            <div className="animate-slideIn">
                                <div className="text-center mb-8">
                                    <KeyRound className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-float" />
                                    <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                                    <p className="text-gray-300">Enter your email to receive reset instructions</p>
                                </div>

                                {resetSent ? (
                                    <div className="text-center p-6 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm animate-fadeIn">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Mail className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-green-300 mb-2">Email Sent!</h3>
                                        <p className="text-green-300">Check your inbox for reset instructions</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleForgotPassword} className="space-y-6">
                                        <div className="transform transition-all duration-300 hover:scale-105">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-purple-400" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                                                    value={forgotEmail}
                                                    onChange={(e) => setForgotEmail(e.target.value)}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPassword(false)}
                                                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold transform hover:scale-105"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold transform hover:scale-105 hover:shadow-lg"
                                            >
                                                Send Reset
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-400">
                                Demo Credentials: admin@gmail.com / password
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Protected by enterprise-grade security
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
                    50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
                }
                
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .animate-blob { animation: blob 7s infinite; }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
                .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
                .animate-gradient { 
                    background-size: 400% 400%; 
                    animation: gradient 3s ease infinite; 
                }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                .animate-slideIn { animation: slideIn 0.5s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default Login;