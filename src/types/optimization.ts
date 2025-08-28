export interface OptimizationMethod {
    id: string;
    name: string;
    description: string;
    advantages: string[];
    disadvantages: string[];
}


export interface OptimizationMetrics {
    method: string;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
}