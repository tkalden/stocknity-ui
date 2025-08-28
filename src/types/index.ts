// Export all types from organized modules
export * from './ai';
export * from './auth';
export * from './cache';
export * from './portfolio';
export * from './stocks';
export * from './system';

// Re-export commonly used types for convenience
export type {
    // Auth
    ApiResponse, AuthResponse, LoginRequest, LoginResponse, ProfileResponse, SignupRequest, SignupResponse, User
} from './auth';

export type {
    ChartData, ChartResponse, ScreenerData, ScreenerResponse,
    // Stocks
    StockData
} from './stocks';

export type {
    AdvancedPortfolioData, AdvancedPortfolioRequest, AdvancedPortfolioResponse, OptimizationMethod, OptimizationMethodsResponse, PortfolioData,
    // Portfolio
    PortfolioRequest, PortfolioResponse, PortfoliosResponse, PortfolioStock
} from './portfolio';

export type {
    ModelPerformanceData, PerformanceResponse, RecommendationsResponse,
    // AI
    SentimentAnalysisData, SentimentResponse, StockRecommendation
} from './ai';

export type {
    CacheInfo, CacheInfoResponse,
    // Cache
    CacheStatus, CacheStatusResponse, CacheTracking, CacheTrackingResponse
} from './cache';

export type {
    ApiError, HealthResponse, HealthStatus,
    // System
    SchedulerStatus, SchedulerStatusResponse
} from './system';

