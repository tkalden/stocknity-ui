export interface ChartData {
    id: string;
    labels: string[];
    title: string;
    values: (number | string)[];
    prices?: Record<string, number>;
}

export interface ChartResponse {
    data: ChartData[];
}