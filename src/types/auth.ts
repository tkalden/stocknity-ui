// Authentication Types
export interface User {
    id: string;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    message: string;
}

// Generic Response Types for Auth
export type LoginResponse = ApiResponse<AuthResponse>;
export type SignupResponse = ApiResponse<AuthResponse>;
export type ProfileResponse = ApiResponse<User>;

// Base API Response Interface
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    code?: string;
}
