import { ApiResponse } from './auth';

// AI Types
export interface SentimentAnalysisData {
    ticker: string;
    overall_sentiment: number;
    confidence: number;
    volume: number;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    top_keywords: string[];
    sources: {
        [key: string]: {
            sentiment: number;
            volume: number;
            confidence: number;
        };
    };
}

export interface StockRecommendation {
    ticker: string;
    score: number;
    confidence: number;
    risk_score: number;
    predicted_return: number;
    reasoning: string;
    data_sources: string[];
}

export interface ModelPerformanceData {
    models: {
        sentiment: {
            accuracy: number;
            precision: number;
            recall: number;
            f1_score: number;
        };
        price_prediction: {
            mae: number;
            rmse: number;
            r2_score: number;
        };
        recommendation: {
            win_rate: number;
            avg_return: number;
            sharpe_ratio: number;
            max_drawdown: number;
        };
    };
    overall_performance: {
        total_recommendations: number;
        profitable_recommendations: number;
        avg_holding_period: string;
    };
}

// Response Types
export type SentimentResponse = ApiResponse<SentimentAnalysisData>;
export type RecommendationsResponse = ApiResponse<StockRecommendation[]>;
export type PerformanceResponse = ApiResponse<ModelPerformanceData>;
