import { ApiResponse } from './auth';

// Portfolio Types
// export interface PortfolioData {
//     id: string;
//     name: string;
//     description?: string;
//     stocks: PortfolioStock[];
//     totalValue: number;
//     totalReturn: number;
//     totalReturnPercent: number;
//     created_at: string;
//     updated_at: string;
// }

// export interface PortfolioStock {
//     symbol: string;
//     name: string;
//     shares: number;
//     price: number;
//     value: number;
//     weight: number;
//     return: number;
//     returnPercent: number;
// }
export interface PortfolioStock {
    Ticker: string;
    Company: string;
    Sector: string;
    Index: string;
    Price: number;
    weight: number;
    invested_amount: number;
    total_shares: number;
    weighted_expected_return: number;
    expected_annual_return: number;
    expected_annual_risk: number;
    strength: number;
    portfolio_id: string;
    created_at: string;
    portfolio_count: number;
}

export interface PortfolioData {
    data: PortfolioStock[];
    portfolio_id: string;
    created_at: string;
    count: number;
}

export interface PortfolioRequest {
    name: string;
    description?: string;
    stocks: {
        symbol: string;
        shares: number;
    }[];
}

// Advanced Portfolio Types
export interface OptimizationMethod {
    id: string;
    name: string;
    description: string;
    parameters: {
        [key: string]: {
            type: 'number' | 'string' | 'boolean';
            default: any;
            min?: number;
            max?: number;
            options?: string[];
        };
    };
}

export interface AdvancedPortfolioRequest {
    method: string;
    parameters: {
        [key: string]: any;
    };
    constraints?: {
        maxStocks?: number;
        minWeight?: number;
        maxWeight?: number;
        sectors?: string[];
    };
}

export interface AdvancedPortfolioData {
    portfolio: PortfolioData;
    optimization: {
        method: string;
        parameters: any;
        metrics: {
            sharpeRatio: number;
            volatility: number;
            expectedReturn: number;
            maxDrawdown: number;
        };
    };
}

// Response Types
export type PortfolioResponse = ApiResponse<PortfolioData>;
export type PortfoliosResponse = ApiResponse<PortfolioData[]>;
export type OptimizationMethodsResponse = ApiResponse<OptimizationMethod[]>;
export type AdvancedPortfolioResponse = ApiResponse<AdvancedPortfolioData>;