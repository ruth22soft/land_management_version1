import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateCredentials, getUserPermissions } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for saved user session
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (err) {
                console.error('Failed to parse saved user:', err);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const validatedUser = validateCredentials(email, password);

            if (!validatedUser) {
                throw new Error('Invalid email or password');
            }

            // Get user permissions
            const permissions = await getUserPermissions(validatedUser.role);
            
            const userWithPermissions = {
                ...validatedUser,
                permissions
            };

            // Save user to local storage
            localStorage.setItem('user', JSON.stringify(userWithPermissions));
            setUser(userWithPermissions);

            return userWithPermissions;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUserProfile = (updates) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
    };

    const hasPermission = (permission) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes('all') || user.permissions.includes(permission);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateUserProfile,
        hasPermission,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
