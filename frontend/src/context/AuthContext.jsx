import {createContext,useState,useContext,useEffect} from 'react';
import API from '../utils/api';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(()=>{
        const storedUser = localStorage.getItem('pos-user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [socket, setSocket] = useState(null);

    // Establish socket connection when user is logged in
    useEffect(() => {
        if (user && (user.id || user._id)) {
            const socketConnection = io('http://localhost:3000');
            setSocket(socketConnection);
            
            // Emit user_online event
            const userId = String(user.id || user._id);
            socketConnection.emit('user_online', userId);
            console.log('Socket connected for user:', userId);
            
            // Handle socket disconnect
            const handleBeforeUnload = () => {
                socketConnection.disconnect();
            };
            
            window.addEventListener('beforeunload', handleBeforeUnload);
            
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
                socketConnection.disconnect();
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [user]);
    
    const login = (userData,token) => {
        setUser(userData);
        localStorage.setItem("pos-user", JSON.stringify(userData));
        localStorage.setItem("pos-token", token);
    };
    
    const logout = async () => {
        try {
            // Call backend logout API to set user as inactive
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Error during logout:', error);
            // Continue with logout even if API call fails
        } finally {
            setUser(null);
            localStorage.removeItem("pos-user");
            localStorage.removeItem("pos-token");
        }
    };
    
    return (
        <AuthContext.Provider value={{user,login,logout,socket}}>
        {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
