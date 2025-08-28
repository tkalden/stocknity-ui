export interface ChartData {
    id: string;
    labels: string[];
    title: string;
    values: (number | string)[];
}

export interface ChartResponse {
    data: ChartData[];
}