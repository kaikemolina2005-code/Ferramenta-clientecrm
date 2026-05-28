import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            const token = authService.getToken();
            if (token) {
                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                }
                catch (error) {
                    authService.logout();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);
    const login = async (email, password) => {
        try {
            const { user: userData } = await authService.login({ email, password });
            setUser(userData);
        }
        catch (error) {
            throw error;
        }
    };
    const logout = async () => {
        await authService.logout();
        setUser(null);
    };
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            updateUser,
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
