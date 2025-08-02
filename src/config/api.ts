// API Configuration
export const API_BASE_URL = 'http://localhost:5001/api';

export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/login',
    SIGNUP: '/signup',
    LOGOUT: '/logout',
    SUBSCRIBE: '/subscribe',

    // User Management
    PROFILE: '/profile',

    // Stock Data
    HOME: '/home',
    SCREENER_DATA: '/screener/data',
    SCREENER: '/screener',

    // Portfolio Management
    PORTFOLIO_DATA: '/portfolio/data',
    PORTFOLIO: '/portfolio',
    MY_PORTFOLIO_DATA: '/my-portfolio/data',
    DELETE_PORTFOLIO: (id: string) => `/delete-portfolio/${id}`,
    CLEAR_BUILT_PORTFOLIO: '/clear-built-portfolio',

    // Charts
    CHART: (type: string) => `/chart/${type}`,
};

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface StockData {
    Ticker: string;
    Company: string;
    Sector: string;
    Index: string;
    Price: string;
    Change: string;
    Volume: string;
    Market_Cap: string;
    PE: string;
    Forward_PE: string;
    PEG: string;
    Debt_Eq: string;
    ROIC: string;
    ROE: string;
    ROI: string;
    Sales_Q_Q: string;
    EPS_Q_Q: string;
    Insider_Own: string;
    strength: string;
    expected_annual_return: string;
    expected_annual_risk: string;
}

export interface PortfolioStock extends StockData {
    weight: string;
    invested_amount: string;
    total_shares: string;
    weighted_expected_return: string;
    portfolio_id: string;
    created_at: string;
    portfolio_count: number;
} 