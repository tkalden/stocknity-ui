import { ApiResponse } from './auth';

// Stock Data Types
export interface StockData {
    Ticker: string;
    Company?: string;
    Sector: string;
    Index: string;
    price: string;
    Change: string;
    Volume: string;
    "Market Cap": string;
    pe: string;
    fpe: string;
    peg: string;
    "Debt/Eq": string;
    ROIC: string;
    roe: string;
    "52W High": string;
    "52W Low": string;
    ATR: string;
    "Avg Volume": string;
    "Change from Open": string;
    "Curr R": string;
    "EPS Next 5Y": string;
    "EPS Next Y": string;
    "EPS Past 5Y": string;
    "EPS This Y": string;
    Earnings: string;
    Float: string;
    Gap: string;
    "Gross M": string;
    "Insider Trans": string;
    "Inst Own": string;
    "Inst Trans": string;
    "LTDebt/Eq": string;
    "Oper M": string;
    Outstanding: string;
    "P/FCF": string;
    "P/S": string;
    "Profit M": string;
    "Quick R": string;
    ROA: string;
    RSI: string;
    SMA20: string;
    SMA200: string;
    SMA50: string;
    "Sales Past 5Y": string;
    "Short Float": string;
    "Short Ratio": string;
    beta: string;
    dividend: string;
    expected_annual_return: string;
    expected_annual_risk: string;
    insider_own: string;
    pb: string;
    pc: string;
    return_risk_ratio: string;
    strength?: string;
}

export interface ScreenerData {
    stocks: StockData[];
    total: number;
    filters: {
        sector: string;
        index: string;
        [key: string]: any;
    };
}

// Chart Types
export interface ChartData {
    title: string;
    labels: string[];
    values: (number | string)[];
}

// Response Types
export type ScreenerResponse = ApiResponse<ScreenerData>;
export type ChartResponse = ApiResponse<ChartData>;
