
export interface ComparisonResult {
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
    method: string;
    top_holdings: Array<{
        ticker: string;
        weight: number;
    }>;
}

export interface BacktestResult {
    total_return: number;
    annualized_return: number;
    volatility: number;
    sharpe_ratio: number;
    max_drawdown: number;
    var_95: number;
    cvar_95: number;
    calmar_ratio: number;
    information_ratio: number;
}