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

const TOKEN_KEY = 'sn_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    axios.defaults.baseURL = API_BASE_URL;
    // No withCredentials — JWT goes in Authorization header, not cookies

    // Attach stored token to every request
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    });

    // Clear auth on 401
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                clearAuth();
            }
            return Promise.reject(error);
        }
    );

    useEffect(() => {
        checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearAuth = () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setIsAuthenticated(false);
    };

    const applyToken = (token: string, userData: User) => {
        localStorage.setItem(TOKEN_KEY, token);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const checkAuthStatus = async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;
        try {
            const response = await axios.get(API_ENDPOINTS.PROFILE);
            if (response.status === 200) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch {
            clearAuth();
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await axios.post(API_ENDPOINTS.LOGIN, { email, password });
            if (response.data.success && response.data.token) {
                applyToken(response.data.token, response.data.user);
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
            const response = await axios.post(API_ENDPOINTS.SIGNUP, { email, name, password, confirm });
            return response.data.success === true;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = () => {
        // JWT is stateless — just drop the token locally
        clearAuth();
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
