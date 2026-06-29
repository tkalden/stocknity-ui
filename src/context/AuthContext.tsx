import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { apiClient, setOnUnauthorized } from '../utils/api';

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
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const clearAuth = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    // Register the shared 401 handler on the single axios instance so any
    // request anywhere in the app clears auth state when the session expires.
    useEffect(() => {
        setOnUnauthorized(clearAuth);
        checkAuthStatus();
        return () => setOnUnauthorized(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Session is derived from /profile: 200 = logged in, anything else = not.
    // The httpOnly cookie (if present) is sent automatically by apiClient.
    const checkAuthStatus = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PROFILE);
            if (response.status === 200 && response.data?.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                clearAuth();
            }
        } catch {
            // 401/network -> not authenticated (interceptor also calls clearAuth on 401)
            clearAuth();
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Server validates credentials and sets the httpOnly session cookie.
            const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
            if (response.data?.success) {
                // Cookie is now set; hydrate user from the login payload if the
                // server returns it, otherwise confirm via /profile.
                if (response.data.user) {
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                } else {
                    await checkAuthStatus();
                }
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
            const response = await apiClient.post(API_ENDPOINTS.SIGNUP, { email, name, password, confirm });
            return response.data?.success === true;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Server clears the httpOnly cookie.
            await apiClient.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuth();
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
