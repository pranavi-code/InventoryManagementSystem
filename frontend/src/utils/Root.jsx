import { useAuth } from '../context/AuthContext.jsx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * Root Component
 *
 * Handles initial routing based on user authentication and role.
 * Automatically redirects users to their appropriate dashboard:
 * - Admin users → Admin Dashboard
 * - Employee users → Employee Dashboard
 * - Unauthenticated users → Login page
 *
 * This component acts as the entry point and ensures users
 * land on the correct page based on their permissions.
 */
const Root = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (user) {
            // Redirect based on user role
            switch (user.role) {
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                case 'employee':
                    navigate('/employee');
                    break;
                default:
                    // Unknown role, redirect to login
                    navigate('/login');
                    break;
            }
        } else {
            // No user logged in, redirect to login
            navigate('/login');
        }
    }, [user, navigate]);
    
    // Show loading state while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

export default Root;