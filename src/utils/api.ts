import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '../types';

// The single, app-wide axios instance.
//
// Auth model: cookie-based sessions. The Spring gateway sets an httpOnly
// `sn_token` cookie on login and reads it on every request, so the browser
// attaches it automatically when `withCredentials` is on. We never read or
// write the token in JS, and there is no Authorization header injection.
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // send/receive the httpOnly session cookie
    headers: {
        'Content-Type': 'application/json',
    },
});

// AuthContext registers a callback here so the response interceptor can clear
// auth state on a 401 without api.ts importing React/AuthContext (avoids a
// circular dependency). This keeps a single 401 handler for the whole app.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setOnUnauthorized(handler: UnauthorizedHandler | null): void {
    onUnauthorized = handler;
}

// Single request interceptor. No token injection — the cookie travels on its
// own. Kept as a hook point for future per-request needs (tracing, etc.).
apiClient.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Single response interceptor. On 401, notify AuthContext (if registered) so
// it can clear local auth state, then re-reject so callers still see the error.
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        if (error.response?.status === 401 && onUnauthorized) {
            onUnauthorized();
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
