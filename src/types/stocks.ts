// Stock Data Types — matches Java ScreenerService response
export interface StockData {
    ticker: string;
    sector: string;
    price: number;
    todayChange: number;
    annualReturn: number;
    dividend: number;
    pe: number | null;
    pb: number | null;
    isLive: boolean;
}

export interface ScreenerResponse {
    data: StockData[];
    count: number;
}

// Chart Types — matches Java ChartController response { data: ChartSector[] }
export interface ChartData {
    id: string;
    title: string;
    labels: string[];
    values: number[];
    prices?: Record<string, number>;
}

export interface ChartResponse {
    data: ChartData[];
}
