import React, { createContext, useState, useContext, useEffect } from 'react';
import accountService from '../services/accountService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = accountService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await accountService.login(credentials);
            const userData = response.data.account;
            setUser(userData);
            const { accessToken} = response.data;
            localStorage.setItem('accessToken', accessToken);
            // Lưu thông tin user vào localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await accountService.register(userData);
            const newUser = response.data.account;
            setUser(newUser);
            const { accessToken} = response.data;
            localStorage.setItem('accessToken', accessToken);
            // Lưu thông tin user vào localStorage
            localStorage.setItem('user', JSON.stringify(newUser));
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await accountService.logout();
            setUser(null);
            // Xóa thông tin user khỏi localStorage
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin',
        isAdminDev: user?.role === 'admindev',
        isAdminBusiness: user?.role === 'adminbusiness',
        isAdmin: user?.role === 'admindev' || user?.role === 'adminbusiness'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 