import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '../types';

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
    (config) => {
        // Add any request headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        // Handle authentication errors globally
        if (error.response?.status === 401) {
            // Redirect to login or clear auth state
            console.log('Authentication required');
        }
        return Promise.reject(error);
    }
);

// Generic API request function with proper typing
export async function apiRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    try {
        const response = await apiClient.request<ApiResponse<T>>({
            method,
            url: endpoint,
            data,
            ...config,
        });
        return response.data;
    } catch (error: any) {
        // Handle axios errors and return consistent error format
        const errorResponse: ApiResponse<T> = {
            success: false,
            error: error.response?.data?.error || error.message || 'An error occurred',
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
        };
        return errorResponse;
    }
}

// Convenience functions for common HTTP methods
export const api = {
    get: <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
        apiRequest<T>('GET', endpoint, undefined, config),

    post: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
        apiRequest<T>('POST', endpoint, data, config),

    put: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
        apiRequest<T>('PUT', endpoint, data, config),

    delete: <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
        apiRequest<T>('DELETE', endpoint, undefined, config),
};

// Helper function to build full URL
export function buildApiUrl(endpoint: string): string {
    return `${API_BASE_URL}${endpoint}`;
}

// Export the configured axios instance for direct use if needed
export { apiClient };

// Export API configuration for components
export { API_BASE_URL, API_ENDPOINTS };

