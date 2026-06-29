// API Configuration
//
// REST calls go through the Spring API gateway (cookie-based auth), NOT the
// Flask analytics app. Set REACT_APP_API_BASE_URL to the Spring gateway origin
// (e.g. https://gateway.stocknity.com/api) in each environment:
//   - local dev: http://localhost:8080/api (Spring gateway on :8080)
//   - production: configured via vercel.json env / Vercel project settings
// The fallback below is the local default only; production MUST set the env var.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

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
    PORTFOLIO_ADVANCED: '/portfolio/advanced',
    PORTFOLIO_COMPARE_METHODS: '/portfolio/compare-methods',
    PORTFOLIO_BACKTEST: '/portfolio/backtest',
    PORTFOLIO_OPTIMIZATION_METHODS: '/portfolio/optimization-methods',

    // Charts
    CHART: (type: string) => `/chart/${type}`,

    // AI Services
    AI_SENTIMENT: (ticker: string) => `/ai/sentiment/${ticker}`,
    AI_SENTIMENT_TREND: (ticker: string) => `/ai/sentiment/${ticker}/trend`,
    AI_RECOMMENDATIONS: '/ai/recommendations',
    AI_PERFORMANCE: '/ai/performance',

    // Cache Management (admin-only — require Bearer token)
    CACHE_STATUS: '/cache/status',
    CACHE_INFO: '/cache/info',
    CACHE_TRACKING: '/cache/tracking',
    CACHE_TRACKING_CLEAR: '/cache/tracking/clear',
    CACHE_REFRESH: '/cache/refresh',
    CACHE_CLEAR: '/cache/clear',
    CACHE_PRE_WARM: '/cache/pre-warm',
    CACHE_ANNUAL_RETURNS_STATUS: '/cache/annual-returns/status',
    ADMIN_CACHE_STATUS: '/cache/status',
    ADMIN_CACHE_REFRESH: '/cache/refresh',

    // Scheduler Management
    SCHEDULER_START: '/scheduler/start',
    SCHEDULER_STOP: '/scheduler/stop',
    SCHEDULER_STATUS: '/scheduler/status',
    SCHEDULER_REFRESH: '/scheduler/refresh',
    SCHEDULER_FORCE_REFRESH: '/scheduler/force-refresh',

    // Health Check
    HEALTH: '/health',
    TEST: '/test',
};

// Constants for UI components
export const indices = [
    'S&P 500',
    'NASDAQ',
    'DOW',
    'Russell 2000',
    'Any'
];

export const sectors = [
    'Any',
    'Technology',
    'Healthcare',
    'Financial',
    'Consumer Discretionary',
    'Consumer Staples',
    'Energy',
    'Industrials',
    'Materials',
    'Real Estate',
    'Utilities',
    'Communication Services'
];

export const riskTolerances = [
    'Conservative',
    'Moderate',
    'Aggressive'
];

export const stockTypes = [
    'Growth',
    'Value',
    'Dividend',
    'Any'
];
