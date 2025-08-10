import {createContext,useState,useContext, use} from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(()=>{
        const storedUser = localStorage.getItem('pos-user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    
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
        <AuthContext.Provider value={{user,login,logout}}>
        {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
