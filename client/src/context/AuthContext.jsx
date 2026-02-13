import { createContext, useContext, useState, useEffect } from 'react';
import { logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('weather_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { }
        }
        setLoading(false);
    }, []);

    const loginUser = (userData) => {
        setUser(userData);
    };

    const logoutUser = () => {
        apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
