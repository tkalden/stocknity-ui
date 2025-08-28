import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface User {
    id: string;
    name: string;
    email: string;
    is_admin?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, name: string, password: string, confirm: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Configure axios defaults
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.withCredentials = true;

    // Add response interceptor to handle 401 errors
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401 && error.response?.data?.code === 'AUTH_REQUIRED') {
                // Handle authentication required error
                setUser(null);
                setIsAuthenticated(false);
            }
            return Promise.reject(error);
        }
    );

    useEffect(() => {
        // Check if user is already logged in
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.PROFILE);
            if (response.status === 200) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await axios.post(API_ENDPOINTS.LOGIN, {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const signup = async (email: string, name: string, password: string, confirm: string): Promise<boolean> => {
        try {
            const response = await axios.post(API_ENDPOINTS.SIGNUP, {
                email,
                name,
                password,
                confirm
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value: AuthContextType = {
        user,
        login,
        signup,
        logout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 