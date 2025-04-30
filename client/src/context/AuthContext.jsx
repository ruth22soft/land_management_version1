import React, { createContext, useContext, useState, useEffect } from 'react';
//import { validateCredentials, getUserPermissions } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API requests


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
    const navigate = useNavigate();


    useEffect(() => {

        const checkAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (err) {
                    console.error('Failed to parse saved user:', err);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);
        // Check for saved user session
    //     const savedUser = localStorage.getItem('user');
    //     if (savedUser) {
    //         try {
    //             const parsedUser = JSON.parse(savedUser);
    //             setUser(parsedUser);
    //         } catch (err) {
    //             console.error('Failed to parse saved user:', err);
    //             localStorage.removeItem('user');
    //         }
    //     }
    //     setLoading(false);
    // }, []);

    const login = async (email, password, userType) => {
        setLoading(true);
        setError(null);
        try{
            const API_BASE_URL = 'http://localhost:5000'; // Or your backend URL
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password,
                role: userType
            });
         
            const { token, user: loggedInUser } = response.data;

            // Check if the role matches the current route
        const currentPath = window.location.pathname;
            if (
                (currentPath.includes('/login/registration') && loggedInUser.role !== 'registration') ||
                (currentPath.includes('/login/admin') && loggedInUser.role !== 'admin')
            ) {
                throw new Error(`Unauthorized role '${loggedInUser.role}' for the route '${currentPath}'.`);

            }

            //store token
            localStorage.setItem('token', token);

            //store user
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);

            //redirect to dashboard
            navigate(`/${loggedInUser.role}/dashboard`);

            setLoading(false);
            return loggedInUser;
        } catch (err) {
            setLoading(false);

                // Extract error message from backend response or fallback to a generic message
            if (err.response) {
                // If the backend returned an error response
                const status = err.response.status;
                const backendMessage = err.response.data?.message;

                if (status === 404) {
                    setError(backendMessage || 'User not found. Please check your email.');
                } else if (status === 401) {
                    setError(backendMessage || 'Invalid email or password. Please try again.');
                } else if (status === 403) {
                    setError(backendMessage || 'You are not authorized to log in from this page.');
                } else {
                    setError(backendMessage || 'An unexpected error occurred.');
                }
            } else if (err.request) {
                // If the request was made but no response was received
                setError('Unable to connect to the server. Please try again later.');
            } else {
                // If something else caused the error
                setError(err.message || 'An unexpected error occurred.');
            }

            console.error('Login error:', err);
            throw err;
        }
    };
    //     try {
    //         setError(null);
    //         const validatedUser = validateCredentials(email, password);

    //         if (!validatedUser) {
    //             throw new Error('Invalid email or password');
    //         }

    //         // Get user permissions
    //         const permissions = await getUserPermissions(validatedUser.role);
            
    //         const userWithPermissions = {
    //             ...validatedUser,
    //             permissions
    //         };

    //         // Save user to local storage
    //         localStorage.setItem('user', JSON.stringify(userWithPermissions));
    //         setUser(userWithPermissions);

    //         return userWithPermissions;
    //     } catch (err) {
    //         setError(err.message);
    //         throw err;
    //     }
    // };

    const logout = () => {
        localStorage.removeItem('token'); // Remove token on logout
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
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

    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateUserProfile,
        hasPermission,
        isAuthenticated
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
