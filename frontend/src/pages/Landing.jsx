import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FaBox, FaChartLine, FaUsers, FaMobileAlt } from 'react-icons/fa';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
            
            // Add scroll effect to header
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(102, 126, 234, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                header.style.backdropFilter = 'none';
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Animate stats on scroll
        const animateStats = () => {
            const stats = document.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const target = parseInt(stat.textContent.replace(/[^\d]/g, ''));
                let current = 0;
                const increment = target / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    stat.textContent = stat.textContent.replace(/\d+/, Math.floor(current));
                }, 20);
            });
        };

        // Intersection Observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('stats')) {
                        animateStats();
                    }
                }
            });
        });

        document.querySelectorAll('.stats').forEach(section => {
            observer.observe(section);
        });
    }, []);

    return (
        <div className="min-h-screen">
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .hero-bg {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    position: relative;
                    overflow: hidden;
                }

                .hero-bg::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>');
                    animation: float 20s infinite linear;
                    pointer-events: none;
                }

                .animate-slideInUp {
                    animation: slideInUp 1s ease-out;
                }

                .animate-slideInUp-delay-1 {
                    animation: slideInUp 1s ease-out 0.2s both;
                }

                .animate-slideInUp-delay-2 {
                    animation: slideInUp 1s ease-out 0.4s both;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease-out;
                }

                .hover-lift {
                    transition: all 0.3s ease;
                }

                .hover-lift:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }

                .feature-card {
                    position: relative;
                    overflow: hidden;
                }

                .feature-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                }

                .feature-card:hover::before {
                    transform: translateX(0);
                }

                .navbar-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    transition: all 0.3s ease;
                    position: fixed;
                    top: 0;
                    width: 100%;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                }

                .btn-primary {
                    background: white;
                    color: #667eea;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                .btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
                }

                .btn-secondary {
                    background: transparent;
                    border: 2px solid white;
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    background: white;
                    color: #667eea;
                    transform: translateY(-2px);
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-5px);
                }

                .floating-animation {
                    animation: float 6s ease-in-out infinite;
                }

                .pulse-animation {
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>

            {/* Navigation */}
            <nav className="navbar-gradient shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <FaBox className="h-8 w-8 text-white floating-animation" />
                                <span className="ml-2 text-xl font-bold text-white">InvenTrack</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link 
                                to="/login" 
                                className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white hover:bg-opacity-20"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className="px-6 py-2 rounded-full text-sm font-medium text-blue-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:transform hover:scale-105"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="hero-bg text-white pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl animate-slideInUp">
                            <span className="block">Smart Inventory Management</span>
                            <span className="block">for MSMEs</span>
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-base opacity-90 sm:text-lg md:mt-8 md:text-xl animate-slideInUp-delay-1">
                            Streamline your business operations with real-time inventory tracking, AI-powered analytics, and automated reporting designed specifically for small and medium enterprises.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4 animate-slideInUp-delay-2">
                            <Link 
                                to="/signup" 
                                className="btn-primary px-8 py-4 border border-transparent text-base font-bold rounded-full md:py-4 md:text-lg md:px-10 inline-flex items-center justify-center"
                            >
                                Start Free Trial
                            </Link>
                            <Link 
                                to="/demo" 
                                className="btn-secondary px-8 py-4 text-base font-medium rounded-full text-white md:py-4 md:text-lg md:px-10 inline-flex items-center justify-center"
                            >
                                Watch Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 stats">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 animate-fadeInUp">Trusted by Thousands of Businesses</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="stat-card">
                            <div className="stat-number text-3xl font-bold mb-2">5000</div>
                            <div className="text-sm opacity-90">Active Businesses</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number text-3xl font-bold mb-2">99</div>
                            <div className="text-sm opacity-90">% Uptime</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number text-3xl font-bold mb-2">250</div>
                            <div className="text-sm opacity-90">Cr+ Revenue Tracked</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-3xl font-bold mb-2">24/7</div>
                            <div className="text-sm opacity-90">Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase animate-fadeInUp">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl animate-fadeInUp">
                            Powerful Features Built for Your Business
                        </p>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 animate-fadeInUp">
                            Everything you need to manage your inventory efficiently
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="feature-card bg-white rounded-xl px-8 py-10 shadow-lg hover-lift">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 pulse-animation">
                                    <FaBox className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Inventory Tracking</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Monitor your stock levels in real-time, get low-stock alerts, and never run out of popular items again.
                                </p>
                            </div>
                        </div>

                        <div className="feature-card bg-white rounded-xl px-8 py-10 shadow-lg hover-lift">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 pulse-animation">
                                    <FaChartLine className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Analytics</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Get intelligent insights and sales predictions to make data-driven decisions for your business growth.
                                </p>
                            </div>
                        </div>

                        <div className="feature-card bg-white rounded-xl px-8 py-10 shadow-lg hover-lift">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 pulse-animation">
                                    <FaUsers className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-User Access</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Manage different user roles for admins and employees with appropriate access controls and permissions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fadeInUp">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose InvenTrack?</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Designed specifically for MSMEs, our platform understands the unique challenges of small businesses and provides solutions that scale with your growth.
                            </p>
                            
                            <div className="space-y-4">
                                {[
                                    "Reduce inventory costs by up to 30%",
                                    "Save 10+ hours per week on manual tracking",
                                    "Improve cash flow with better stock management",
                                    "Scale your business with confidence",
                                    "Integration with popular accounting software",
                                    "Mobile-responsive design for on-the-go access"
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700 font-medium">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center animate-fadeInUp">
                            <div className="text-6xl mb-4">🚀</div>
                            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h3>
                            <p className="text-lg opacity-90 mb-6">
                                Join thousands of successful MSMEs who have streamlined their operations with InvenTrack.
                            </p>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-filter backdrop-blur-sm">
                                <div className="text-3xl font-bold mb-2">📈</div>
                                <div className="text-lg">Average 25% increase in efficiency</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of businesses already using InvenTrack to streamline their inventory management
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/signup" 
                            className="bg-white text-blue-600 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 hover:transform hover:scale-105 inline-flex items-center justify-center"
                        >
                            Start Your Free Trial
                        </Link>
                        <Link 
                            to="/demo" 
                            className="border-2 border-white text-white font-medium py-4 px-8 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 hover:transform hover:scale-105 inline-flex items-center justify-center"
                        >
                            Schedule a Demo
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <FaBox className="h-8 w-8 text-blue-500" />
                                <span className="ml-2 text-xl font-bold">InvenTrack</span>
                            </div>
                            <p className="text-gray-400">
                                Smart inventory management designed for MSMEs to streamline operations and boost growth.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-blue-400">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-blue-400">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-blue-400">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-center md:text-left">
                            &copy; 2025 InvenTrack. All rights reserved. | Built for MSMEs with ❤️
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;